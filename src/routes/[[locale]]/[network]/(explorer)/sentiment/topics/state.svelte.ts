import type { NameType } from '@wharfkit/antelope';
import { Name } from '@wharfkit/antelope';
import { serializeStatistics } from '$lib/state/sentiment/poll';
import type { NetworkState } from '$lib/state/network.svelte';
import type {
	TopicWithStats,
	VoteWithWeight,
	PaginationMeta,
	ApiResponse,
	TopicsListData,
	TopicVotesData,
	TopicStatistics,
	MetricLens
} from '$lib/types/sentiment';

export class TopicSentimentState {
	public network: NetworkState;
	private apiBaseUrl: string;

	public topics = $state<TopicWithStats[]>([]);
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

	private serializeStatistics(statistics: TopicStatistics): TopicStatistics {
		const systemTokenSymbol = this.network.chain.systemToken?.symbol;
		if (!systemTokenSymbol) {
			throw new Error('network systemToken is not configured');
		}
		return serializeStatistics(statistics, systemTokenSymbol);
	}

	async loadTopics(page = 1, limit = 20): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const url = `${this.apiBaseUrl}/topics?page=${page}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<TopicsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load topics');
			}

			this.topics = result.data.topics.map((topic) => ({
				...topic,
				statistics: this.serializeStatistics(topic.statistics)
			}));
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load topics';
			console.error('Error loading topics:', e);
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
			const url = `${this.apiBaseUrl}/topics?page=${nextPage}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<TopicsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load more topics');
			}

			const newTopics = result.data.topics.map((topic) => ({
				...topic,
				statistics: this.serializeStatistics(topic.statistics)
			}));
			this.topics = [...this.topics, ...newTopics];
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load more topics';
			console.error('Error loading more topics:', e);
		} finally {
			this.loadingMore = false;
		}
	}

	async loadTopicVotes(topicId: NameType, page = 1, limit = 50, sort?: MetricLens): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const id = String(Name.from(topicId));

			const url = `${this.apiBaseUrl}/topics/${id}/votes?page=${page}&limit=${limit}${sort ? `&sort=${sort}` : ''}`;

			const response = await this.network.fetch(url);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<TopicVotesData> = await response.json();

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
			console.error(`Error loading votes for topic ${topicId}:`, e);
		} finally {
			this.loading = false;
		}
	}
}
