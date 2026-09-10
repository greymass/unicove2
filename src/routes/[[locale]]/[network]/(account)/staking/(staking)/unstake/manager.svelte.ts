import { Action, Asset } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import { AssetInput } from '@wharfkit/svelte-components';

import type { UnstakingRecord } from '$lib/utils/staking';
import {
	defaultQuantity,
	getUnstakableBalance,
	getUnstakableREX,
	getUnstakingBalances
} from '$lib/utils/staking';
import { PlaceholderAuth } from '@wharfkit/session';
import { Types as REXTypes } from '$lib/types/rex';

export class UnstakeManager {
	public input: AssetInput | undefined = $state();
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public assetValue: Asset = $state(defaultQuantity);
	public minValue = $state(0);
	public maxValue = $state(0);

	public assetValid = $state(false);
	public assetValidPrecision = $state(true);
	public assetValidMinimum = $state(true);
	public assetValidMaximum = $state(true);

	public error: string = $state('');
	public txid: string = $state('');

	public staked: Asset = $derived(getUnstakableBalance(this.network, this.account));
	public unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(this.network, this.account)
	);
	public unstakable: Asset = $derived(
		getUnstakableBalance(this.network, this.account, this.unstaking)
	);
	public tokenBalance = $derived(this.account?.balance.child('staked'));

	constructor(network: NetworkState) {
		this.network = network;
		this.assetValue = this.zeroValue;
	}

	get zeroValue() {
		return this.network ? Asset.from(0, this.network.chain.systemToken!.symbol) : defaultQuantity;
	}

	sync(network: NetworkState, account: AccountState, wharf: WharfState) {
		let changed = false;
		if (network.chain != this.network?.chain) {
			this.network = network;
			changed = true;
		}
		if (this.account !== account) {
			this.account = account;
			changed = true;
		}

		if (changed) {
			this.error = '';
			this.txid = '';
		}

		if (this.network && !this.assetValue.symbol.equals(this.network.chain.systemToken!.symbol)) {
			this.input?.set(this.zeroValue);
		}
		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}

		if (this.network) {
			this.minValue = Asset.fromUnits(1, this.network.chain.systemToken!.symbol).value;
			this.maxValue = this.unstakable.value;
		}
	}

	setMaxValue() {
		this.input?.set(this.unstakable);
	}

	async transact() {
		try {
			if (!this.network || !this.account || !this.account.name || !this.assetValue || !this.wharf) {
				throw new Error("Can't sign, data not ready");
			}

			let rex = this.network.tokenToRex(this.assetValue);
			if (this.assetValue.equals(this.unstakable)) {
				rex = getUnstakableREX(this.network, this.account);
			}

			const mvfrsavings = Action.from({
				account: this.network.contracts.system.account,
				name: 'mvfrsavings',
				authorization: [PlaceholderAuth],
				data: REXTypes.mvfrsavings.from({
					owner: this.account.name,
					rex
				})
			});

			const result = await this.wharf.transact({
				actions: [mvfrsavings]
			});

			this.txid = String(result?.response?.transaction_id);
			if (!this.txid) {
				this.error = 'no txid';
			}
		} catch (error) {
			this.error = String(error);
		}
	}
}
