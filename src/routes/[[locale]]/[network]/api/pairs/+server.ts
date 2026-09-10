import { json, type RequestEvent } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import type { NetworkState } from '$lib/state/network.svelte';
import { TokenDataSources, TokenDefinition, tokenEquals, TokenPair } from '$lib/types/token';
import { Asset, Chains, TimePointSec } from '@wharfkit/session';
import { Currencies } from '$lib/types/currencies';
import { RAMState } from '@wharfkit/resources';
import {
	PUBLIC_FEATURE_CMC_APIKEY,
	PUBLIC_FEATURE_CMC_PAIRS,
	PUBLIC_LEGACY_TOKEN_EXCHANGERATE
} from '$env/static/public';
import { cmctokens } from './cmctokenmap';
import { localizePath } from '$lib/utils/url';

export async function GET({ fetch, locals: { network }, url }: RequestEvent) {
	const pairs: TokenPair[] = [];
	const currency = await fetch(localizePath(`/api/currency/usd`));
	if (currency.ok) {
		const fiat = await currency.json();
		pairs.push(...fiat.pairs.map((pair: TokenPair) => TokenPair.from(pair)));
	}

	const ram = await network.resourceClient.v1.ram.get_state();
	const rammarket = RAMState.from(ram).price_per_kb(1);

	// Allow mock data for prices to be passed for testing
	const mockPrice = url.searchParams.get('mock');
	if (mockPrice) {
		pairs.push(
			TokenPair.from({
				base: network.token,
				quote: { id: Currencies.USD },
				price: mockPrice,
				updated: TimePointSec.from(new Date())
			})
		);
		if (network.config.legacytoken) {
			pairs.push(
				TokenPair.from({
					base: network.config.legacytoken,
					quote: { id: Currencies.USD },
					price: mockPrice,
					updated: TimePointSec.from(new Date())
				})
			);
		}
	}

	// If the legacy token exists and has an exchange rate, add it
	if (network.config.legacytoken && PUBLIC_LEGACY_TOKEN_EXCHANGERATE) {
		const exchangeRate = Asset.from(PUBLIC_LEGACY_TOKEN_EXCHANGERATE);
		pairs.push(
			TokenPair.from({
				base: network.token,
				quote: network.config.legacytoken,
				price: exchangeRate,
				updated: TimePointSec.from(new Date())
			})
		);
	}

	// Push RAM token pair
	pairs.push(
		TokenPair.from({
			base: network.getRamToken(),
			quote: network.token,
			price: rammarket,
			updated: network.connection.updated
		})
	);

	// Push BRAM token pair
	pairs.push(
		TokenPair.from({
			base: {
				id: {
					symbol: '0,BRAM',
					contract: 'ram.defi',
					chain: network.chain.id
				}
			},
			quote: network.token,
			price: Asset.fromUnits(rammarket.units.dividing(1000), network.token.symbol),
			updated: network.connection.updated
		})
	);

	// Push WRAM token pair
	pairs.push(
		TokenPair.from({
			base: network.getWRAMToken(),
			quote: network.token,
			price: Asset.fromUnits(rammarket.units.dividing(1000), network.token.symbol),
			updated: network.connection.updated
		})
	);

	// Push CMC token pairs
	const cmcpairs = await deriveCMCPairs();
	pairs.push(...cmcpairs);

	if (network.supports('delphihelper')) {
		pairs.push(...(await delphihelper(network)));
	} else if (network.supports('delphioracle')) {
		pairs.push(...(await delphioracle(network)));
	}

	for (const alt of network.config.systemtokenalt) {
		const altPair = TokenDefinition.from({
			symbol: alt
		});

		pairs.forEach((pair) => {
			if (tokenEquals(pair.base.id, altPair)) {
				pairs.push(
					TokenPair.from({
						base: network.token,
						quote: pair.quote,
						price: pair.price,
						updated: network.connection.updated
					})
				);
			}
			return;
		});
	}

	const derived = deriveAdditionalPairs(pairs);

	return json(
		TokenDataSources.from({
			ts: new Date(),
			mockPrice,
			pairs: derived
		}),
		{
			headers: getCacheHeaders(300)
		}
	);
}

async function delphioracle(network: NetworkState): Promise<TokenPair[]> {
	const rows = await network.contracts.delphioracle.table('pairs').all();
	const pairs: TokenPair[] = [];
	for (const pair of rows.filter((pair) => pair.active)) {
		const latest = await network.contracts.delphioracle.table('datapoints', pair.name).get();
		if (latest && latest.timestamp) {
			const updated = latest.timestamp.toDate();
			// Skip prices older than 24hrs
			if (Number(updated) < new Date().getTime() - 1000 * 60 * 60 * 24) {
				continue;
			}
			const quoteSymbol = Asset.Symbol.from(`${pair.quoted_precision},${pair.quote_symbol.code}`);
			pairs.push(
				TokenPair.from({
					base: {
						id: {
							symbol: pair.base_symbol,
							contract: !pair.base_contract.equals('') ? pair.base_contract : undefined,
							chain: !pair.base_contract.equals('') ? network.chain.id : undefined
						}
					},
					quote: {
						id: {
							symbol: quoteSymbol,
							contract: !pair.quote_contract.equals('') ? pair.quote_contract : undefined,
							chain: !pair.quote_contract.equals('') ? network.chain.id : undefined
						}
					},
					price: Asset.fromUnits(latest.median, quoteSymbol),
					updated: TimePointSec.from(updated)
				})
			);
		}
	}
	return pairs;
}

async function delphihelper(network: NetworkState): Promise<TokenPair[]> {
	const rows = await network.contracts.delphihelper.readonly('getpairs');
	const pairs = [];
	for (const pair of rows) {
		// Skip prices older than 24hrs
		const updated = pair.updated.toDate();
		if (Number(updated) < new Date().getTime() - 1000 * 60 * 60 * 24) {
			continue;
		}
		pairs.push(
			TokenPair.from({
				...pair,
				base: {
					id: {
						symbol: pair.base.symbol,
						contract: pair.base.contract.equals('') ? undefined : pair.base.contract,
						chain: pair.base.contract.equals('') ? undefined : network.chain.id
					}
				},
				quote: {
					id: {
						symbol: pair.quote.symbol,
						contract: pair.quote.contract.equals('') ? undefined : pair.quote.contract,
						chain: pair.quote.contract.equals('') ? undefined : network.chain.id
					}
				}
			})
		);
	}
	return pairs;
}

const USDT = TokenDefinition.from({
	symbol: '4,USDT',
	contract: 'tethertether',
	chain: Chains.EOS.id
});

const mappings = [
	{
		original: Currencies.USD,
		variants: [USDT]
	}
];

function findMatchingBasePairs(pairs: TokenPair[], base: TokenDefinition): TokenPair[] {
	const matches = pairs.filter((pair) => tokenEquals(pair.base.id, base));
	const mapping = mappings.find((mapping) => tokenEquals(mapping.original, base));
	if (mapping) {
		for (const variant of mapping.variants) {
			const match = pairs.find((pair) => tokenEquals(pair.base.id, variant));
			if (match) {
				matches.push(match);
			}
		}
	}
	return matches;
}

function deriveAdditionalPairs(pairs: TokenPair[]): TokenPair[] {
	const derived = [...pairs];

	// Add any pairs that can be derived from the existing pairs (e.g. EOS/BTC -> BTC/CNY = EOS/CNY)
	// TODO: Refactor for better recursion
	for (const pair of pairs) {
		const derivablePairs = findMatchingBasePairs(pairs, pair.quote.id);
		for (const possiblePair of derivablePairs) {
			const exists = !!pairs.find(
				(p) =>
					tokenEquals(p.base.id, pair.base.id) && tokenEquals(p.quote.id, possiblePair.quote.id)
			);
			if (!exists) {
				const pairDate = pair.updated.toDate();
				const possiblePairDate = possiblePair.updated.toDate();
				const updated = pairDate < possiblePairDate ? pairDate : possiblePairDate;
				derived.push(
					TokenPair.from({
						base: pair.base,
						quote: possiblePair.quote,
						// Use floats since precision lengths can be mixed
						price: Asset.fromFloat(
							Number(pair.price.value) * Number(possiblePair.price.value),
							possiblePair.quote.symbol
						),
						updated
					})
				);
			}
		}
	}

	// Recurse one level deep to derive additional pairs
	if (pairs.length !== derived.length) {
		const more = deriveAdditionalPairs(derived);
		if (more.length !== derived.length) {
			return more;
		}
	}

	// Check for any missing reversed pairs
	for (const pair of derived) {
		// Skip any reverse pairs without a value
		if (!pair.price.value) {
			continue;
		}
		const exists = pairs.find(
			(p) => tokenEquals(p.base.id, pair.quote.id) && tokenEquals(p.quote.id, pair.base.id)
		);
		if (!exists) {
			derived.push(pair.reversed);
		}
	}

	return derived;
}

// Very rough CoinMarketCap API response types - missing lots of fields
interface CMCDataQuote {
	price: number;
}
interface CMCDataResult {
	id: number;
	name: string;
	quote: Record<string, CMCDataQuote>;
}
interface CMCData {
	data: Record<number, CMCDataResult>;
}

async function deriveCMCPairs(): Promise<TokenPair[]> {
	if (PUBLIC_FEATURE_CMC_APIKEY) {
		try {
			const response = await fetch(
				`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${PUBLIC_FEATURE_CMC_PAIRS}`,
				{
					headers: {
						'X-CMC_PRO_API_KEY': PUBLIC_FEATURE_CMC_APIKEY
					}
				}
			);
			const json = (await response.json()) as CMCData;
			const pairs = [];
			for (const id in json.data) {
				pairs.push(
					TokenPair.from({
						base: cmctokens[id],
						quote: { id: Currencies.USD },
						price: Asset.fromFloat(json.data[id].quote['USD'].price, USDT.symbol),
						updated: new Date()
					})
				);
			}
			return pairs;
		} catch (error) {
			console.error('Error fetching CoinMarketCap data:', error);
		}
	}
	return [];
}
