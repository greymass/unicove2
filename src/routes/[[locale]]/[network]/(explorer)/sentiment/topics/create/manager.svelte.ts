import { Action, Name } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import { PlaceholderAuth } from '@wharfkit/session';
import { Types } from '$lib/wharf/contracts/sentiment';

export class CreateTopicManager {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public topicId: Name = $state(Name.from(''));
	public topicIdValid: boolean = $state(false);
	public description: string = $state('');
	public error: string = $state('');
	public txid: string = $state('');

	public canSubmit: boolean = $derived.by(() => {
		return this.topicIdValid && this.description.length > 0;
	});

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

	async transact(config: Types.config_row) {
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf) {
				throw new Error("Can't sign, data not ready");
			}

			const sentiment = this.network.contracts.sentiment;
			const actions: Action[] = [];

			const balance = await sentiment
				.table('balance', sentiment.account)
				.get(String(this.account.name));

			if (!balance) {
				actions.push(
					sentiment.action('open', {
						account: PlaceholderAuth.actor
					})
				);
			}

			const transferAction = this.network.contracts.token.action('transfer', {
				from: PlaceholderAuth.actor,
				to: sentiment.account,
				quantity: config.fees.createtopic,
				memo: 'sentiment topic creation fee'
			});
			transferAction.account = config.fees.token.contract;
			actions.push(transferAction);

			actions.push(
				sentiment.action('createtopic', {
					creator: PlaceholderAuth.actor,
					id: this.topicId,
					description: this.description,
					payment: config.fees.createtopic
				})
			);

			const result = await this.wharf.transact({ actions });
			this.txid = String(result?.response?.transaction_id);
			if (!this.txid) {
				this.error = 'no txid';
			}
		} catch (error) {
			this.error = String(error);
		}
	}
}
