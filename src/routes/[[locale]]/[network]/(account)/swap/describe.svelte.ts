import type { Asset } from '@wharfkit/antelope';

import type { NetworkState } from '$lib/state/network.svelte';
import type { NetworkValueState } from '$lib/state/value.svelte';
import { tokenEquals, ZeroUnits, type Token, type TokenSwap } from '$lib/types/token';

export type SwapKind = 'market' | 'wrap' | 'legacy' | 'other';

export interface SwapDescription {
	kind: SwapKind;
	title: string;
	summary: string;
	verb: string;
	fixedRate: boolean;
}

export interface SwapGroup {
	kind: SwapKind;
	label: string;
	caption: string;
	swaps: TokenSwap[];
}

function isRam(network: NetworkState, token: Token): boolean {
	return tokenEquals(token.id, network.getRamToken().id);
}

function isWram(network: NetworkState, token: Token): boolean {
	if (!network.supports('wram')) {
		return false;
	}
	return tokenEquals(token.id, network.getWRAMToken().id);
}

function isLegacy(network: NetworkState, token: Token): boolean {
	const legacy = network.config.legacytoken;
	if (!legacy) {
		return false;
	}
	return tokenEquals(token.id, legacy.id);
}

// RAM is denominated in KB, so its symbol name does not work as a display name.
export function tokenLabel(network: NetworkState, token: Token): string {
	if (isRam(network, token)) {
		return `RAM`;
	}
	return token.symbol.name;
}

function swapKind(network: NetworkState, base: Token, quote: Token): SwapKind {
	if (isWram(network, base) || isWram(network, quote)) {
		return 'wrap';
	}
	if (isRam(network, base) || isRam(network, quote)) {
		return 'market';
	}
	if (isLegacy(network, base) || isLegacy(network, quote)) {
		return 'legacy';
	}
	return 'other';
}

export function describeSwap(network: NetworkState, swap: TokenSwap): SwapDescription {
	return describeTokens(network, swap.pair.base, swap.pair.quote);
}

export function describeTokens(
	network: NetworkState,
	baseToken: Token,
	quoteToken: Token
): SwapDescription {
	const kind = swapKind(network, baseToken, quoteToken);
	const base = tokenLabel(network, baseToken);
	const quote = tokenLabel(network, quoteToken);

	if (kind === 'market') {
		if (isRam(network, quoteToken)) {
			return {
				kind,
				title: `Buy ${quote}`,
				summary: `Spend ${base} to add ${quote} to your account, at the current market rate.`,
				verb: `Buy ${quote}`,
				fixedRate: false
			};
		}
		return {
			kind,
			title: `Sell ${base}`,
			summary: `Release ${base} back to the network in exchange for ${quote}, at the current market rate.`,
			verb: `Sell ${base}`,
			fixedRate: false
		};
	}

	if (kind === 'wrap') {
		if (isWram(network, quoteToken)) {
			return {
				kind,
				title: `Wrap ${base} into ${quote}`,
				summary: `Turn account ${base} into the transferable ${quote} token, one for one.`,
				verb: `Wrap ${base}`,
				fixedRate: true
			};
		}
		return {
			kind,
			title: `Unwrap ${base} into ${quote}`,
			summary: `Turn ${base} tokens back into account ${quote}, one for one.`,
			verb: `Unwrap ${base}`,
			fixedRate: true
		};
	}

	if (kind === 'legacy') {
		if (isLegacy(network, baseToken)) {
			return {
				kind,
				title: `Migrate ${base} to ${quote}`,
				summary: `Exchange legacy ${base} for ${quote} at a fixed one to one rate.`,
				verb: `Migrate ${base}`,
				fixedRate: true
			};
		}
		return {
			kind,
			title: `Convert ${base} back to ${quote}`,
			summary: `Exchange ${base} for legacy ${quote} at a fixed one to one rate.`,
			verb: `Convert ${base}`,
			fixedRate: true
		};
	}

	return {
		kind,
		title: `Swap ${base} to ${quote}`,
		summary: `Exchange ${base} for ${quote}.`,
		verb: `Swap ${base}`,
		fixedRate: false
	};
}

export interface SwapRate {
	price: Asset;
	per: string;
}

// Fractional fixed rates read better inverted; market rates are never flipped.
export function swapRate(network: NetworkState, swap: TokenSwap): SwapRate {
	const { fixedRate } = describeSwap(network, swap);
	const value = swap.pair.price.value;
	if (fixedRate && value > 0 && value < 1) {
		const reversed = swap.pair.reversed;
		return { price: reversed.price, per: tokenLabel(network, reversed.base) };
	}
	return { price: swap.pair.price, per: tokenLabel(network, swap.pair.base) };
}

// Price of one whole unit of a token in the display currency, when one is known.
export function unitPrice(
	network: NetworkState,
	value: NetworkValueState,
	token: Token
): Asset | undefined {
	const ram = network.getRamToken();
	let price: Asset | undefined;
	if (tokenEquals(token.id, ram.id)) {
		price = value.ram.price;
	} else if (tokenEquals(token.id, network.token.id)) {
		price = value.systemtoken.price;
	} else if (network.config.legacytoken && tokenEquals(token.id, network.config.legacytoken.id)) {
		price = value.legacytoken?.price;
	}
	if (!price || price.units.lte(ZeroUnits)) {
		return undefined;
	}
	return price;
}

export function groupSwaps(network: NetworkState, swaps: TokenSwap[]): SwapGroup[] {
	const groups: SwapGroup[] = [
		{
			kind: 'legacy',
			label: `Legacy tokens`,
			caption: `Fixed one to one between the legacy and system token.`,
			swaps: []
		},
		{
			kind: 'market',
			label: `RAM market`,
			caption: `Priced by the network, moves with demand.`,
			swaps: []
		},
		{
			kind: 'other',
			label: `Other`,
			caption: `Additional swaps available on this network.`,
			swaps: []
		},
		{
			kind: 'wrap',
			label: `Wrapping`,
			caption: `Fixed one to one, no rate risk.`,
			swaps: []
		}
	];
	for (const swap of swaps) {
		const kind = swapKind(network, swap.pair.base, swap.pair.quote);
		const group = groups.find((g) => g.kind === kind);
		if (group) {
			group.swaps.push(swap);
		}
	}
	// Lead each group with the direction that adds to the account
	const order = ['buyram', 'ramtransfer', 'sellram'];
	for (const group of groups) {
		group.swaps.sort((a, b) => {
			const rank = (swap: TokenSwap) => {
				const index = order.indexOf(String(swap.action));
				return index === -1 ? order.length : index;
			};
			return rank(a) - rank(b);
		});
	}
	return groups.filter((group) => group.swaps.length > 0);
}
