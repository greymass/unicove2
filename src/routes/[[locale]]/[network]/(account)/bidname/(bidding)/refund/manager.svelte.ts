import { Asset } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';

export class BidRefundManager {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public bidName: string = $state('');
	public refundAmount: Asset | undefined = $state();
	public loading: boolean = $state(false);
	public error: string = $state('');
	public txid: string = $state('');

	public hasRefund: boolean = $derived(!!this.refundAmount && this.refundAmount.value > 0);
	public canRefund: boolean = $derived(this.hasRefund && this.bidName.length > 0);

	constructor(network: NetworkState) {
		this.network = network;
	}

	sync(network: NetworkState, account: AccountState, wharf: WharfState) {
		let changed = false;
		if (network.chain !== this.network?.chain) {
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

		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}
	}

	async loadRefund() {
		if (!this.network || !this.account || !this.bidName) return;

		this.loading = true;
		this.error = '';
		try {
			const refund = await this.network.contracts.eosio
				.table('bidrefunds', this.bidName)
				.get(this.account.name);
			this.refundAmount = refund?.amount;
		} catch (e) {
			this.error = String(e);
		} finally {
			this.loading = false;
		}
	}

	async transact() {
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf) {
				throw new Error("Can't sign, data not ready");
			}

			const actions = [
				this.network.contracts.system.action('bidrefund', {
					bidder: this.account.name,
					newname: this.bidName
				})
			];

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
