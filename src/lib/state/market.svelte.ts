import { Asset, Serializer, TimePointSec } from '@wharfkit/antelope';

import {
	SystemHistoricPrices,
	Token,
	TokenDataSources,
	tokenEquals,
	TokenHistoricPrice,
	TokenHistoricPrices,
	TokenPair,
	TokenSwap,
	ZeroUnits
} from '$lib/types/token';
import { TokenDefinition } from '$lib/types/token';
import { Currencies, SupportedCurrencies } from '$lib/types/currencies';

import type { NetworkState } from './network.svelte';
import type { SettingsState } from './settings.svelte';
import { ramtoken } from '$lib/wharf/chains';
import { calculateValue } from '$lib/utils';
import { localizePath } from '$lib/utils/url';

export class MarketState {
	private sources: TokenDataSources = $state() as TokenDataSources;

	public refreshed: TimePointSec = $state(TimePointSec.fromInteger(0));
	readonly loaded = $derived(this.refreshed.value.gt(ZeroUnits));

	readonly settings = $state() as SettingsState;
	readonly network = $state() as NetworkState;

	readonly pairs = $derived([
		...this.sources.pairs,
		...this.sources.pairs.map((pair) => pair.reversed)
	]);

	readonly historic = $derived(
		this.sources.historic
			? this.getHistoric(this.sources.historic, this.settings.data.displayCurrency)
			: undefined
	);

	readonly swaps = $derived(getSwaps(this.network, this.pairs));

	constructor(network: NetworkState, settings: SettingsState) {
		this.network = network;
		this.settings = settings;

		this.sources = TokenDataSources.from({
			ts: new Date(),
			pairs: []
		});
	}

	public async refresh() {
		const basePair = Currencies[this.settings.data.displayCurrency];
		const encoded = Serializer.encode({ object: basePair });
		let url = localizePath(`/api/pairs/${encoded}`);
		if (this.settings.data.mockPrice) {
			// Allow mock data for prices to be passed for testing
			url += `?mock=${Asset.fromUnits(12345, basePair.symbol)}`;
		}
		const response = await this.network.fetch(url);
		if (response.ok) {
			const json = await response.json();
			this.sources = TokenDataSources.from(json);
			this.refreshed = TimePointSec.from(new Date());
		}
	}

	value(base: TokenDefinition, quote: TokenDefinition, balance: Asset): Asset {
		const pair = this.getPair(base, quote);
		if (!pair) {
			return Asset.fromUnits(0, quote.symbol);
		}
		// Use floats since precision lengths can be mixed
		return Asset.fromFloat(Number(pair.price.value) * Number(balance.value), quote.symbol);
	}

	getPair(base: TokenDefinition, quote: TokenDefinition): TokenPair | undefined {
		return this.pairs.find((p) => tokenEquals(p.base.id, base) && tokenEquals(p.quote.id, quote));
	}

	getSwap(base: TokenDefinition, quote: TokenDefinition): TokenSwap | undefined {
		const swap = this.swaps.find(
			(swap) => tokenEquals(swap.pair.base.id, base) && tokenEquals(swap.pair.quote.id, quote)
		);
		if (swap) {
			return swap;
		}
	}

	getRAMTokenPair(quote: Token): TokenPair | undefined {
		const ramKb = this.network.getRamToken();
		const pair = this.pairs.find(
			(pair) => tokenEquals(pair.base.id, ramKb.id) && tokenEquals(pair.quote.id, quote.id)
		);
		if (!pair) {
			return TokenPair.from({
				base: ramKb,
				quote,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return pair;
	}

	getSystemTokenPair(quote: Token): TokenPair | undefined {
		const pair = this.pairs.find(
			(p) => tokenEquals(p.base.id, this.network.token.id) && tokenEquals(p.quote.id, quote.id)
		);
		if (!pair) {
			return TokenPair.from({
				base: this.network.token,
				quote,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return pair;
	}

	getHistoric(
		historic: SystemHistoricPrices,
		displayCurrency: SupportedCurrencies
	): SystemHistoricPrices {
		const currency = Currencies[displayCurrency];
		if (historic.ram?.day?.value.symbol.equals(currency.symbol)) {
			// Return as-is if the display currency is correct
			return historic;
		}
		// Convert the values to the display currency
		const pair = this.getPair(Currencies.USD, currency);
		if (pair) {
			for (const key in historic) {
				const assetType = key as keyof SystemHistoricPrices;
				const asset = historic[assetType] as TokenHistoricPrices;
				if (asset) {
					for (const timeframe in historic[assetType]) {
						const timeframeType = timeframe as keyof TokenHistoricPrices;
						const price = asset[timeframeType] as TokenHistoricPrice;
						if (price) {
							price.value = calculateValue(price.value, pair.price);
						}
					}
				}
			}
		}
		return historic;
	}

	getPairs(token: TokenDefinition): TokenPair[] {
		return this.pairs.filter((pair) => {
			return TokenDefinition.from(pair.base).equals(TokenDefinition.from(token));
		});
	}

	toJSON() {
		return {
			pairs: this.pairs
		};
	}
}

function getSwaps(network: NetworkState, pairs: TokenPair[]): TokenSwap[] {
	const swaps: TokenSwap[] = [
		...getRAMTokenSwaps(network, pairs),
		...getWRAMTokenSwaps(network),
		...getLegacyTokenSwaps(network, pairs)
	];
	return swaps;
}

function getLegacyTokenSwaps(network: NetworkState, pairs: TokenPair[]): TokenSwap[] {
	const swaps: TokenSwap[] = [];
	if (network.config.legacytoken) {
		const {
			token,
			config: { legacytoken }
		} = network;

		const legacyPair = pairs.find(
			(pair) => tokenEquals(pair.base.id, legacytoken.id) && tokenEquals(pair.quote.id, token.id)
		);
		if (legacyPair) {
			swaps.push(
				TokenSwap.from({
					pair: legacyPair,
					contract: network.token.contract,
					action: 'transfer',
					reversible: !!network.config.features.legacyexchangereversible
				})
			);
		}

		const newPair = pairs.find(
			(pair) => tokenEquals(pair.base.id, token.id) && tokenEquals(pair.quote.id, legacytoken.id)
		);
		if (newPair) {
			swaps.push(
				TokenSwap.from({
					pair: newPair,
					contract: network.token.contract,
					action: 'transfer'
				})
			);
		}
	}
	return swaps;
}

// Create pairs for RAM buy/sell as "swap" actions
function getRAMTokenSwaps(network: NetworkState, pairs: TokenPair[]): TokenSwap[] {
	const swaps: TokenSwap[] = [];
	const { token } = network;

	const ramsystemtoken = pairs.find(
		(pair) => tokenEquals(pair.base.id, ramtoken.id) && tokenEquals(pair.quote.id, token.id)
	);
	if (ramsystemtoken) {
		swaps.push(
			TokenSwap.from({
				pair: ramsystemtoken,
				contract: network.config.systemcontract,
				action: 'sellram',
				fee: {
					token,
					ramfee: true
				}
			})
		);
	}

	const systemtokenram = pairs.find(
		(pair) => tokenEquals(pair.base.id, token.id) && tokenEquals(pair.quote.id, ramtoken.id)
	);
	if (systemtokenram) {
		swaps.push(
			TokenSwap.from({
				pair: systemtokenram,
				contract: network.config.systemcontract,
				action: 'buyram',
				fee: {
					token,
					ramfee: true
				}
			})
		);
	}

	return swaps;
}

// Create pairs for WRAM "swap" actions
function getWRAMTokenSwaps(network: NetworkState): TokenSwap[] {
	if (!network.supports('wram')) {
		return [];
	}
	const ram = network.getRamToken();
	const wram = network.getWRAMToken();
	return [
		TokenSwap.from({
			pair: TokenPair.from({
				base: ram,
				quote: wram,
				price: Asset.fromUnits(1000, wram.symbol),
				updated: new Date()
			}),
			contract: network.config.systemcontract,
			action: 'ramtransfer'
		}),
		TokenSwap.from({
			pair: TokenPair.from({
				base: wram,
				quote: ram,
				price: Asset.fromUnits(1, ram.symbol),
				updated: new Date()
			}),
			contract: 'eosio.wram',
			action: 'transfer'
		})
	];
}
