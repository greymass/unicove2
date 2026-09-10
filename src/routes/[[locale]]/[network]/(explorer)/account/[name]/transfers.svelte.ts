import { type API } from '@wharfkit/antelope';
import { ActivityResponseAction } from '$lib/types/transaction';
import { localizePath } from '$lib/utils/url';
import { PaginatorPage } from './activity/state.v2.svelte.js';

export { PaginatorPage };

export class TransfersPaginator {
	private network: string;
	private fetch: typeof fetch;
	private account?: string;
	private contract: string;
	private startDate?: string;
	private endDate?: string;
	private order: 'asc' | 'desc' = 'desc';
	private limit: number = 20;

	public page: PaginatorPage = $state(new PaginatorPage());

	constructor(network: string, fetchOverride: typeof fetch, defaultContract: string) {
		this.network = network;
		this.fetch = fetchOverride;
		this.contract = defaultContract;
	}

	public setAccount(account: string) {
		if (this.account !== account) {
			this.account = account;
			this.page.reset();
		} else if (Date.now() - this.page.updatedTime > 10_000) {
			this.page.reset();
		}
	}

	public setContract(contract: string) {
		this.contract = contract;
	}

	public getContract(): string {
		return this.contract;
	}

	public setDateRange(startDate: string, endDate: string) {
		this.startDate = startDate;
		this.endDate = endDate;
	}

	public setOrder(order: 'asc' | 'desc') {
		this.order = order;
	}

	public setLimit(limit: number) {
		this.limit = limit;
	}

	public load(cursor?: string) {
		if (!this.account) throw new Error('set account first');
		if (this.page.isLoading) return;
		this.loadRemote(cursor);
	}

	public loadNext() {
		if (!this.account) throw new Error('set account first');
		if (this.page.isLoading || !this.page.hasNext) return;
		this.loadRemote(this.page.nextCursor);
	}

	public loadPrev() {
		if (!this.account) throw new Error('set account first');
		if (this.page.isLoading || !this.page.hasPrev) return;
		this.loadRemote(this.page.prevCursor);
	}

	private async loadRemote(cursor?: string) {
		try {
			if (!this.account) return;
			const account = this.account;
			this.page.setLoading(true);

			const params = new URLSearchParams();
			if (cursor) {
				params.set('cursor', cursor);
			}
			params.set('contract', this.contract);
			params.set('action', 'transfer');
			if (this.startDate) {
				params.set('start_date', this.startDate);
			}
			if (this.endDate) {
				params.set('end_date', this.endDate);
			}
			if (this.order !== 'desc') {
				params.set('order', this.order);
			}
			if (this.limit !== 20) {
				params.set('limit', String(this.limit));
			}

			const queryString = params.toString();
			const path = localizePath(
				`/api/account/${account}/activity2${queryString ? `?${queryString}` : ''}`
			);

			const response = await this.fetch(path);
			if (!response.ok) {
				throw new Error(`Error while loading transfers for ${account}.`);
			}
			const json = await response.json();
			const { results, next_cursor, prev_cursor } = json.activity;

			const actions = this.transformResults(results);

			this.page.setResults(actions, next_cursor, prev_cursor);
		} catch (error: unknown) {
			console.error('Error fetching transfer actions:', error);
			this.page.setError(error instanceof Error ? error : new Error(String(error)));
		}
	}

	private transformResults(results: API.v1.OrderedActionsResult[]): ActivityResponseAction[] {
		return results.map((result) => {
			const trace = result.action_trace;
			return ActivityResponseAction.from({
				global_action_seq: result.global_action_seq,
				account_action_seq: result.account_action_seq,
				block_num: result.block_num,
				block_time: result.block_time,
				action_trace: trace
			});
		});
	}
}
