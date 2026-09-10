import { Action, Asset } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import { AssetInput } from '@wharfkit/svelte-components';

import {
	defaultQuantity,
	getStakableBalance,
	getAPR,
	getUnstakableBalance,
	getUnstakingBalances,
	type UnstakingRecord
} from '$lib/utils/staking';
import { Types as REXTypes } from '$lib/types/rex';
import { PlaceholderAuth } from '@wharfkit/session';

export class StakeManager {
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

	public unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(this.network, this.account)
	);
	public staked: Asset = $derived(getUnstakableBalance(this.network, this.account));
	public stakable: Asset = $derived(getStakableBalance(this.network, this.account));
	public apr: string = $derived(
		this.network ? getAPR(this.network.token.distribution?.staked) : '0'
	);
	public estimateYield: Asset = $derived(
		this.network
			? Asset.from(
					(this.assetValue.value * parseFloat(this.apr)) / 100,
					this.network.chain.systemToken!.symbol
				)
			: defaultQuantity
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
			this.maxValue = this.account ? getStakableBalance(this.network, this.account).value : 0;
		}
	}

	setMaxValue() {
		this.input?.set(this.stakable);
	}

	async transact() {
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf || !this.assetValue) {
				throw new Error("Can't sign, data not ready");
			}

			const deposit = Action.from({
				account: this.network.contracts.system.account,
				name: 'deposit',
				authorization: [PlaceholderAuth],
				data: REXTypes.deposit.from({
					owner: this.account.name,
					amount: this.assetValue
				})
			});

			const buyrex = Action.from({
				account: this.network.contracts.system.account,
				name: 'buyrex',
				authorization: [PlaceholderAuth],
				data: REXTypes.buyrex.from({
					from: this.account.name,
					amount: this.assetValue
				})
			});

			const actions = [deposit, buyrex];

			const claimableBalance = this.unstaking
				.filter((b) => b.claimable)
				.reduce((acc, x) => acc + parseFloat(x.rex.toString()), 0);
			if (claimableBalance > 0 && claimableBalance < 10000) {
				actions.unshift(
					Action.from({
						account: this.network.contracts.system.account,
						name: 'mvtosavings',
						authorization: [PlaceholderAuth],
						data: REXTypes.mvtosavings.from({
							owner: this.account.name,
							rex: `${claimableBalance.toFixed(4)} REX`
						})
					})
				);
			}

			const result = await this.wharf.transact({
				actions
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
