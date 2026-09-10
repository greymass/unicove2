import type { NameType } from '@wharfkit/antelope';
import { Name } from '@wharfkit/antelope';
import { serializeStatistics } from '$lib/state/sentiment/poll';
import type { NetworkState } from '$lib/state/network.svelte';
import type {
	MsigWithStats,
	VoteWithWeight,
	PaginationMeta,
	ApiResponse,
	MsigsListData,
	MsigVotesData,
	MsigStatistics,
	MetricLens
} from '$lib/types/sentiment';

export class MsigSentimentState {
	public network: NetworkState;
	private apiBaseUrl: string;

	public msigs = $state<MsigWithStats[]>([]);
	public currentVotes = $state<VoteWithWeight[]>([]);
	public loading = $state(false);
	public loadingMore = $state(false);
	public error = $state<string | null>(null);
	public pagination = $state<PaginationMeta | null>(null);

	constructor(network: NetworkState, locale: string = 'en') {
		this.network = network;
		const networkShort = network.config.short;
		this.apiBaseUrl = `/${locale}/${networkShort}/api/sentiment`;
	}

	private serializeStatistics(statistics: MsigStatistics): MsigStatistics {
		const systemTokenSymbol = this.network.chain.systemToken?.symbol;
		if (!systemTokenSymbol) {
			throw new Error('network systemToken is not configured');
		}
		return serializeStatistics(statistics, systemTokenSymbol);
	}

	async loadMsigs(page = 1, limit = 20): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const url = `${this.apiBaseUrl}/msigs?page=${page}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<MsigsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load msigs');
			}

			this.msigs = result.data.msigs.map((msig) => ({
				...msig,
				statistics: this.serializeStatistics(msig.statistics)
			}));
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load msigs';
			console.error('Error loading msigs:', e);
		} finally {
			this.loading = false;
		}
	}

	async loadMore(): Promise<void> {
		if (!this.pagination?.hasMore || this.loadingMore) {
			return;
		}

		this.loadingMore = true;
		this.error = null;

		try {
			const nextPage = this.pagination.page + 1;
			const limit = this.pagination.limit;
			const url = `${this.apiBaseUrl}/msigs?page=${nextPage}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<MsigsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load more msigs');
			}

			const newMsigs = result.data.msigs.map((msig) => ({
				...msig,
				statistics: this.serializeStatistics(msig.statistics)
			}));
			this.msigs = [...this.msigs, ...newMsigs];
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load more msigs';
			console.error('Error loading more msigs:', e);
		} finally {
			this.loadingMore = false;
		}
	}

	async loadMsigVotes(
		proposer: NameType,
		proposalName: NameType,
		page = 1,
		limit = 50,
		sort?: MetricLens
	): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const proposerStr = String(Name.from(proposer));
			const proposalStr = String(Name.from(proposalName));

			const url = `${this.apiBaseUrl}/msigs/${proposerStr}/${proposalStr}/votes?page=${page}&limit=${limit}${sort ? `&sort=${sort}` : ''}`;

			const response = await this.network.fetch(url);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<MsigVotesData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load votes');
			}

			const newVotes = result.data.votes;
			const newPagination = result.data.pagination;

			if (JSON.stringify(this.currentVotes) !== JSON.stringify(newVotes)) {
				this.currentVotes = newVotes;
			}

			if (JSON.stringify(this.pagination) !== JSON.stringify(newPagination)) {
				this.pagination = newPagination;
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load votes';
			console.error(`Error loading votes for msig ${proposer}/${proposalName}:`, e);
		} finally {
			this.loading = false;
		}
	}
}
