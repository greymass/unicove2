import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { calculateValue, getCacheHeaders } from '$lib/utils';
import type { NetworkState } from '$lib/state/network.svelte';
import { Asset } from '@wharfkit/session';
import { Currencies } from '$lib/types/currencies';
import { TokenHistoricPrice, TokenHistoricPrices } from '$lib/types/token';

export const GET: RequestHandler = async ({ locals: { network } }) => {
	try {
		const systemTokenPair = `${network.token.symbol.name}usd`.toLowerCase();
		const systemRamPair = `ram`;

		if (!network.config.endpoints.metrics) {
			return json({
				systemtoken: {},
				ram: {}
			});
		}

		const systemtoken = TokenHistoricPrices.from({
			day: await getHistoricPrice(network, systemTokenPair, '1d', Currencies.USD.symbol),
			week: await getHistoricPrice(network, systemTokenPair, '1w', Currencies.USD.symbol),
			month: await getHistoricPrice(network, systemTokenPair, '1mo', Currencies.USD.symbol),
			quarter: await getHistoricPrice(network, systemTokenPair, '3mo', Currencies.USD.symbol),
			year: await getHistoricPrice(network, systemTokenPair, '1y', Currencies.USD.symbol)
		});

		const ramsystemtoken = TokenHistoricPrices.from({
			day: await getHistoricPrice(network, systemRamPair, '1d', network.token.symbol),
			week: await getHistoricPrice(network, systemRamPair, '1w', network.token.symbol),
			month: await getHistoricPrice(network, systemRamPair, '1mo', network.token.symbol),
			quarter: await getHistoricPrice(network, systemRamPair, '3mo', network.token.symbol),
			year: await getHistoricPrice(network, systemRamPair, '1y', network.token.symbol)
		});

		const ram = TokenHistoricPrices.from({
			day: convertRamToUSD(ramsystemtoken.day, systemtoken.day),
			week: convertRamToUSD(ramsystemtoken.week, systemtoken.week),
			month: convertRamToUSD(ramsystemtoken.month, systemtoken.month),
			quarter: convertRamToUSD(ramsystemtoken.quarter, systemtoken.quarter),
			year: convertRamToUSD(ramsystemtoken.year, systemtoken.year)
		});

		return json(
			{
				ram,
				ramsystemtoken,
				systemtoken
			},
			{
				headers: getCacheHeaders(60)
			}
		);
	} catch (error) {
		console.warn(error);
		return json([]);
	}
};

function convertRamToUSD(
	ram: TokenHistoricPrice | undefined,
	systemToken: TokenHistoricPrice | undefined
): TokenHistoricPrice | undefined {
	if (!ram || !systemToken) {
		return undefined;
	}
	return TokenHistoricPrice.from({
		value: calculateValue(ram.value, systemToken.value),
		date: ram.date
	});
}

async function getHistoricPrice(
	network: NetworkState,
	identifier: string,
	timeframe: string,
	symbol: Asset.Symbol
): Promise<TokenHistoricPrice> {
	const response = await fetch(
		`${network.config.endpoints.metrics}/historicprice/${identifier}/${timeframe}`
	);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const json = await response.json();
	if (json.length === 0) {
		throw new Error(`No data found for ${identifier} in ${timeframe}`);
	}
	return TokenHistoricPrice.from({
		date: new Date(json[0]._time),
		value: Asset.fromUnits(json[0]._value, symbol)
	});
}
