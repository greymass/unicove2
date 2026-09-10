import type { Asset } from '@wharfkit/antelope';

export interface Topic {
	id: string;
	description: string;
	lastUpdated: string;
}

export type MetricLens = 'system' | 'ram' | 'v';

export interface MetricComponentStats {
	support: number;
	opposition: number;
	total: number;
}

export interface AssetMetricStats extends MetricComponentStats {
	supportPercentage: number;
	oppositionPercentage: number;
	components?: { staked: MetricComponentStats; liquid: MetricComponentStats };
}

export interface StatisticsMetrics {
	system: AssetMetricStats;
	ram: AssetMetricStats;
	v: AssetMetricStats;
}

export interface VoteMetrics {
	system: { total: number; staked: number; liquid: number };
	ram: { total: number };
	v: { total: number; staked: number; liquid: number };
}

export interface SentimentStatistics {
	totalVotes: number;
	supportVotes: number;
	oppositionVotes: number;
	totalWeight: number;
	totalSupportWeight: number;
	totalOppositionWeight: number;
	supportPercentage: number;
	oppositionPercentage: number;
	totalWeightAsset: Asset;
	totalSupportWeightAsset: Asset;
	totalOppositionWeightAsset: Asset;
	metrics: StatisticsMetrics;
}

export type TopicStatistics = SentimentStatistics;
export type MsigStatistics = SentimentStatistics;

export interface TopicWithStats {
	topic: Topic;
	statistics: SentimentStatistics;
}

export interface VoteWithWeight {
	voter: string;
	voteType: number;
	weight: number;
	lastUpdated: string;
	metrics: VoteMetrics;
}

export interface PaginationMeta {
	limit: number;
	page: number;
	totalPages: number;
	total: number;
	hasMore: boolean;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface TopicsListData {
	topics: TopicWithStats[];
	pagination: PaginationMeta;
}

export interface TopicDetailData {
	topic: Topic;
	statistics: SentimentStatistics;
}

export interface TopicVotesData {
	votes: VoteWithWeight[];
	pagination: PaginationMeta;
}

export interface MsigProposal {
	proposer: string;
	proposalName: string;
	lastUpdated: string;
}

export interface MsigWithStats {
	msig: MsigProposal;
	statistics: SentimentStatistics;
}

export interface MsigsListData {
	msigs: MsigWithStats[];
	pagination: PaginationMeta;
}

export interface MsigDetailData {
	msig: MsigProposal;
	statistics: SentimentStatistics;
}

export interface MsigVotesData {
	votes: VoteWithWeight[];
	pagination: PaginationMeta;
}
