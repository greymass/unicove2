import { Asset, PermissionLevel } from '@wharfkit/antelope';
import { parseMsigApprovals, type VpMsigApprovals } from '$lib/vp/onchain';
import type {
	ApiResponse,
	AssetMetricStats,
	MetricComponentStats,
	MsigProposal,
	SentimentStatistics,
	StatisticsMetrics,
	Topic,
	VoteMetrics
} from '$lib/types/sentiment';

export const IDLE_MS = 60_000;
export const BURST_MS = 1_000;
export const BURST_TIMEOUT_MS = 30_000;

export type SentimentTarget =
	| { kind: 'topic'; id: string }
	| { kind: 'msig'; proposer: string; proposal: string };

export type RawStatistics = Omit<
	SentimentStatistics,
	'totalWeightAsset' | 'totalSupportWeightAsset' | 'totalOppositionWeightAsset'
>;

export interface OwnVote {
	voteType: number;
	weight: number;
	lastUpdated: string;
	metrics: VoteMetrics;
}

export interface DetailResponse {
	topic?: Topic;
	msig?: MsigProposal;
	statistics: RawStatistics;
	vote?: OwnVote | null;
}

export interface MsigApprovalSnapshot {
	status: string;
	provided: PermissionLevel[];
	requested: PermissionLevel[];
	summary: VpMsigApprovals;
}

export interface ExpectedApproval {
	level: string;
	provided: boolean;
}

interface PathOptions {
	voter?: string;
	bypass?: number;
}

function withQuery(path: string, params: Record<string, string | undefined>): string {
	const query = Object.entries(params)
		.filter((entry): entry is [string, string] => entry[1] !== undefined)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join('&');
	return query ? `${path}?${query}` : path;
}

export function detailPath(base: string, target: SentimentTarget, options: PathOptions): string {
	const path =
		target.kind === 'topic'
			? `${base}/topics/${target.id}`
			: `${base}/msigs/${target.proposer}/${target.proposal}`;
	return withQuery(path, {
		voter: options.voter,
		t: options.bypass === undefined ? undefined : String(options.bypass)
	});
}

export function approvalsPath(
	base: string,
	target: Extract<SentimentTarget, { kind: 'msig' }>,
	options: Pick<PathOptions, 'bypass'>
): string {
	return withQuery(`${base}/${target.proposer}/${target.proposal}`, {
		t: options.bypass === undefined ? undefined : String(options.bypass)
	});
}

export function emptyMetrics(): VoteMetrics {
	return {
		system: { total: 0, staked: 0, liquid: 0 },
		ram: { total: 0 },
		v: { total: 0, staked: 0, liquid: 0 }
	};
}

function shift(
	value: number,
	previous: number | null,
	next: number | null,
	side: number,
	amount: number
) {
	let result = value;
	if (previous === side) result -= amount;
	if (next === side) result += amount;
	return Math.max(result, 0);
}

function percentages(support: number, opposition: number) {
	const total = support + opposition;
	return {
		total,
		supportPercentage: total ? (support / total) * 100 : 0,
		oppositionPercentage: total ? (opposition / total) * 100 : 0
	};
}

function shiftComponent(
	stats: MetricComponentStats,
	previous: number | null,
	next: number | null,
	amount: number
): MetricComponentStats {
	const support = shift(stats.support, previous, next, 1, amount);
	const opposition = shift(stats.opposition, previous, next, 0, amount);
	return { support, opposition, total: support + opposition };
}

function shiftLens(
	stats: AssetMetricStats,
	previous: number | null,
	next: number | null,
	amount: number,
	parts?: { staked: number; liquid: number }
): AssetMetricStats {
	const support = shift(stats.support, previous, next, 1, amount);
	const opposition = shift(stats.opposition, previous, next, 0, amount);
	const lens: AssetMetricStats = { support, opposition, ...percentages(support, opposition) };
	if (stats.components && parts) {
		lens.components = {
			staked: shiftComponent(stats.components.staked, previous, next, parts.staked),
			liquid: shiftComponent(stats.components.liquid, previous, next, parts.liquid)
		};
	} else if (stats.components) {
		lens.components = stats.components;
	}
	return lens;
}

export function applyOwnVote(
	raw: RawStatistics,
	previous: number | null,
	next: number | null,
	weight: VoteMetrics
): RawStatistics {
	const metrics: StatisticsMetrics = {
		system: shiftLens(raw.metrics.system, previous, next, weight.system.total, weight.system),
		ram: shiftLens(raw.metrics.ram, previous, next, weight.ram.total),
		v: shiftLens(raw.metrics.v, previous, next, weight.v.total, weight.v)
	};
	const supportVotes = shift(raw.supportVotes, previous, next, 1, 1);
	const oppositionVotes = shift(raw.oppositionVotes, previous, next, 0, 1);
	return {
		totalVotes: supportVotes + oppositionVotes,
		supportVotes,
		oppositionVotes,
		totalWeight: metrics.system.total,
		totalSupportWeight: metrics.system.support,
		totalOppositionWeight: metrics.system.opposition,
		supportPercentage: metrics.system.supportPercentage,
		oppositionPercentage: metrics.system.oppositionPercentage,
		metrics
	};
}

export function serializeStatistics(raw: RawStatistics, symbol: Asset.Symbol): SentimentStatistics {
	return {
		...raw,
		totalWeightAsset: Asset.fromUnits(raw.totalWeight, symbol),
		totalSupportWeightAsset: Asset.fromUnits(raw.totalSupportWeight, symbol),
		totalOppositionWeightAsset: Asset.fromUnits(raw.totalOppositionWeight, symbol)
	};
}

export function hasDrainedMetrics(metrics: VoteMetrics): boolean {
	return metrics.system.total > 0 || metrics.ram.total > 0 || metrics.v.total > 0;
}

export function isVoteReconciled(
	expected: number | null,
	vote: OwnVote | null | undefined
): boolean {
	if (vote === undefined) return false;
	if (expected === null) return vote === null;
	return vote !== null && vote.voteType === expected && hasDrainedMetrics(vote.metrics);
}

export function parseApprovalSnapshot(json: unknown): MsigApprovalSnapshot | null {
	const summary = parseMsigApprovals(json);
	if (!summary) return null;
	const row = json as {
		status?: string;
		provided_approvals: unknown[];
		requested_approvals?: unknown[];
	};
	return {
		status: row.status ?? 'proposed',
		provided: row.provided_approvals.map((level) => PermissionLevel.from(level as never)),
		requested: (row.requested_approvals ?? []).map((level) => PermissionLevel.from(level as never)),
		summary
	};
}

export function isApprovalReconciled(
	expected: ExpectedApproval,
	snapshot: MsigApprovalSnapshot
): boolean {
	const present = snapshot.provided.some((level) => String(level) === expected.level);
	return present === expected.provided;
}

export function applyExpectedApproval(
	provided: PermissionLevel[],
	requested: PermissionLevel[],
	expected: ExpectedApproval
): { provided: PermissionLevel[]; requested: PermissionLevel[] } {
	const level = PermissionLevel.from(expected.level);
	const isLevel = (entry: PermissionLevel) => entry.equals(level);
	if (expected.provided) {
		if (provided.some(isLevel)) return { provided, requested };
		return { provided: [...provided, level], requested: requested.filter((e) => !isLevel(e)) };
	}
	if (!provided.some(isLevel)) return { provided, requested };
	return { provided: provided.filter((e) => !isLevel(e)), requested: [...requested, level] };
}

export async function fetchDetail(fetchFn: typeof fetch, path: string): Promise<DetailResponse> {
	const response = await fetchFn(path);
	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`);
	}
	const result: ApiResponse<DetailResponse> = await response.json();
	if (!result.success || !result.data) {
		throw new Error(result.error || 'Failed to load sentiment');
	}
	return result.data;
}
