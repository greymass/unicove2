import type { Asset } from '@wharfkit/antelope';
import { PlaceholderAuth } from '@wharfkit/session';

import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { TokenSwap } from '$lib/types/token';

export function deriveSwapAction(
	network: NetworkState,
	account: AccountState,
	swap: TokenSwap,
	quantity: Asset
) {
	if (!swap || !account || !swap.pair.base.contract) {
		return;
	}
	const defaultSwap = {
		from: account.name,
		to: swap.contract,
		quantity: quantity,
		memo: ''
	};
	let contract = swap.pair.base.contract;
	const action = swap.action;
	let data = {};
	switch (String(swap.contract)) {
		case String(network.config.systemcontract): {
			switch (String(swap.action)) {
				// Modify action to 'buyram' for RAM swap
				case 'buyram': {
					if (!swap.pair.quote.contract) {
						throw new Error('Missing quote contract for RAM swap');
					}
					contract = swap.pair.quote.contract;
					data = {
						payer: account.name,
						receiver: account.name,
						quant: quantity
					};
					break;
				}
				case 'sellram': {
					data = {
						account: account.name,
						bytes: String(quantity.units)
					};
					break;
				}
				case 'ramtransfer': {
					data = {
						from: account.name,
						to: swap.pair.quote.contract,
						bytes: String(quantity.units),
						memo: ''
					};
					break;
				}
				default: {
					data = defaultSwap;
					break;
				}
			}
			break;
		}
		default: {
			data = defaultSwap;
			break;
		}
	}
	return {
		account: contract,
		name: action,
		authorization: [PlaceholderAuth],
		data
	};
}
