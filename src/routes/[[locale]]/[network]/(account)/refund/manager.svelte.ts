import { Asset } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';

export class RefundManager {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public error: string = $state('');
	public txid: string = $state('');

	public refunding: Asset = $derived.by(() => {
		if (!this.account || !this.account.balance) {
			return Asset.fromUnits(0, '0,UNKNOWN');
		}

		return this.account.balance.child('refunding').balance;
	});

	public dateAvailable: Date | undefined = $derived.by(() => {
		if (!this.account || !this.network || !this.account.refundRequest) {
			return undefined;
		}
		const initiated = new Date(String(this.account.refundRequest.request_time + 'z'));
		const available = new Date(initiated.setHours(initiated.getHours() + 72));
		return available;
	});

	public refundable: boolean = $derived.by(() => {
		return this.dateAvailable ? new Date() >= this.dateAvailable : true;
	});

	constructor(network: NetworkState) {
		this.network = network;
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

		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}
	}

	async transact() {
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf) {
				throw new Error("Can't sign, data not ready");
			}

			const actions = [
				this.network.contracts.system.action('refund', {
					owner: this.account.name
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
