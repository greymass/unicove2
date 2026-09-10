import { getCacheHeaders } from '$lib/utils';
import {
	SystemHistoricPrices,
	TokenDataSources,
	TokenDefinition,
	tokenEquals,
	TokenPair
} from '$lib/types/token';
import { Asset, Serializer } from '@wharfkit/session';
import type { RequestEvent } from './$types';
import { json } from '@sveltejs/kit';
import { localizePath } from '$lib/utils/url';

export async function GET({ fetch, locals: { network }, params, url }: RequestEvent) {
	let basePair: TokenDefinition;
	try {
		basePair = Serializer.decode({ data: params.base, type: TokenDefinition });
	} catch (error) {
		return json({ error: String(error) }, { status: 400 });
	}
	// Allow mock data for prices to be passed for testing
	const mockPrice = url.searchParams.get('mock');
	let pairsUrl = localizePath(`/api/pairs`);
	if (mockPrice) {
		pairsUrl += `?mock=${Asset.from(mockPrice)}`;
	}
	const response = await fetch(pairsUrl);
	if (!response.ok) {
		return json({ error: 'Failed to fetch pairs' }, { status: 500 });
	}
	const data = await response.json();
	const pairs = data.pairs.filter(
		(pair: TokenPair) =>
			tokenEquals(pair.base.id, basePair) ||
			tokenEquals(pair.base.id, network.token.id) ||
			tokenEquals(pair.quote.id, basePair)
	);
	if (tokenEquals(basePair, network.token.id)) {
		network.config.systemtokenalt.forEach((altSymbol: Asset.Symbol) => {
			const altPair = TokenDefinition.from({
				symbol: altSymbol
			});
			const newPairs = data.pairs.filter((pair: TokenPair) => tokenEquals(pair.base.id, altPair));
			pairs.push(...newPairs);
		});
	}
	const historic: SystemHistoricPrices = SystemHistoricPrices.from({});
	if (network.supports('timeseries')) {
		const response = await fetch(localizePath(`/api/metrics/marketprice/historic`));
		if (response.ok) {
			const parsedResponse = await response.json();
			historic.ram = parsedResponse.ram;
			historic.systemtoken = parsedResponse.systemtoken;
		}
	}
	return json(
		TokenDataSources.from({
			ts: new Date(),
			mockPrice,
			pairs,
			historic
		}),
		{
			headers: getCacheHeaders(300)
		}
	);
}
