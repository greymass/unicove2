import { type API } from '@wharfkit/antelope';
import { ActivityResponseAction } from '$lib/types/transaction';
import { localizePath } from '$lib/utils/url';

export class PaginatorPage {
	firstTime: number = $state(0);
	updatedTime: number = $state(0);
	results: ActivityResponseAction[] = $state([]);
	nextCursor: string | undefined = $state(undefined);
	prevCursor: string | undefined = $state(undefined);
	isLoading: boolean = $state(false);
	hasNext: boolean = $state(false);
	hasPrev: boolean = $state(false);
	error: Error | undefined = $state(undefined);

	setLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	setResults(results: ActivityResponseAction[], nextCursor?: string, prevCursor?: string) {
		this.results = [...results];
		this.isLoading = false;
		this.error = undefined;
		this.nextCursor = nextCursor;
		this.prevCursor = prevCursor;
		this.hasNext = !!nextCursor && results.length > 0;
		this.hasPrev = !!prevCursor;
		this.firstTime = this.updatedTime = Date.now();
	}

	setError(error: Error) {
		this.error = error;
		this.isLoading = false;
	}

	reset() {
		this.firstTime = 0;
		this.updatedTime = 0;
		this.results = [];
		this.nextCursor = undefined;
		this.prevCursor = undefined;
		this.isLoading = false;
		this.hasNext = false;
		this.hasPrev = false;
		this.error = undefined;
	}
}

export class ActivityPaginator {
	private static instance: ActivityPaginator;

	private network: string;
	private fetch: typeof fetch;
	private account?: string;
	private contract?: string;
	private action?: string;
	private date?: string;
	private startDate?: string;
	private endDate?: string;
	private order: 'asc' | 'desc' = 'desc';
	private limit: number = 20;

	public filtering = $state(false);
	public page: PaginatorPage = $state(new PaginatorPage());

	private constructor(network: string, fetchOverride: typeof fetch) {
		this.network = network;
		this.fetch = fetchOverride;
	}

	public static getInst(network: string, fetchOverride: typeof fetch): ActivityPaginator {
		if (!ActivityPaginator.instance || ActivityPaginator.instance.network !== network) {
			ActivityPaginator.instance = new ActivityPaginator(network, fetchOverride);
		}
		return ActivityPaginator.instance;
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

	public setAction(action: string) {
		this.action = action;
	}

	public setDate(date: string) {
		this.date = date;
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
			if (this.contract) {
				params.set('contract', this.contract);
			}
			if (this.action) {
				params.set('action', this.action);
			}
			if (this.date) {
				params.set('date', this.date);
			}
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

			this.filtering = !!(
				this.contract ||
				this.action ||
				this.date ||
				this.startDate ||
				this.endDate ||
				this.order !== 'desc' ||
				this.limit !== 20
			);

			const queryString = params.toString();
			const path = localizePath(
				`/api/account/${account}/activity2${queryString ? `?${queryString}` : ''}`
			);

			const response = await this.fetch(path);
			if (!response.ok) {
				throw new Error(`Error while loading activity for ${account}.`);
			}
			const json = await response.json();
			const { results, next_cursor, prev_cursor } = json.activity;

			const actions = this.transformResults(results);

			this.page.setResults(actions, next_cursor, prev_cursor);
		} catch (error: unknown) {
			console.error('Error fetching activity actions:', error);
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
