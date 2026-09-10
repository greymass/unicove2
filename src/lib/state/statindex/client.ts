export interface NetworkStatsEntry {
	date: string;
	actions: number;
	transactions: number;
	unique_accounts: number;
	first_time_actors: number;
	new_accounts: number;
	new_contracts: number;
}

export interface ContractLeaderboardEntry {
	contract: string;
	actions: number;
	unique_callers: number;
	new_callers: number;
}

export interface AccountLeaderboardEntry {
	account: string;
	actions: number;
	actions_authorized: number;
	actions_received: number;
	transactions: number;
	transactions_authorized: number;
	transactions_received: number;
}

export interface StatPeriod {
	start: string;
	end: string;
	total_actions: number;
	total_first_time_actors?: number;
	total_transactions?: number;
}

export type ContractSort = 'actions' | 'unique_callers' | 'new_callers';
export type AccountSort =
	| 'actions'
	| 'actions_authorized'
	| 'transactions'
	| 'transactions_authorized';

export interface StatRequestParams {
	start: string;
	end?: string;
	granularity?: 'hourly' | 'daily' | 'monthly' | 'yearly';
	limit?: number;
	sortBy?: string;
	excludeSystem?: boolean;
}

export class StatindexError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'StatindexError';
		this.status = status;
	}
}

function buildQueryString(params: StatRequestParams): string {
	const query = new URLSearchParams();
	query.set('start', params.start);
	if (params.end) query.set('end', params.end);
	if (params.granularity) query.set('granularity', params.granularity);
	if (params.limit) query.set('limit', String(params.limit));
	if (params.sortBy) query.set('sort_by', params.sortBy);
	query.set('exclude_system', params.excludeSystem ? 'true' : 'false');
	return query.toString();
}

export class StatindexClient {
	private fetchFn: typeof fetch;

	constructor(
		private baseUrl: string,
		customFetch?: typeof fetch
	) {
		this.fetchFn = customFetch ?? fetch;
	}

	private async fetch<T>(path: string): Promise<T> {
		let response: Response;
		try {
			response = await this.fetchFn(`${this.baseUrl}${path}`);
		} catch {
			throw new StatindexError('Unable to reach the network stats service', 0);
		}
		if (!response.ok) {
			let message = `HTTP ${response.status}`;
			try {
				const body = await response.json();
				if (body.error || body.message) message = body.error || body.message;
			} catch {
				// non-JSON error body; keep the HTTP status message
			}
			throw new StatindexError(message, response.status);
		}
		return response.json();
	}

	async getNetworkStats(params: StatRequestParams): Promise<{ data: NetworkStatsEntry[] }> {
		return this.fetch(`/network?${buildQueryString(params)}`);
	}

	async getTopContracts(
		params: StatRequestParams
	): Promise<{ period: StatPeriod; data: ContractLeaderboardEntry[] }> {
		return this.fetch(`/contracts?${buildQueryString(params)}`);
	}

	async getTopAccounts(
		params: StatRequestParams
	): Promise<{ period: StatPeriod; data: AccountLeaderboardEntry[] }> {
		return this.fetch(`/accounts?${buildQueryString(params)}`);
	}
}
