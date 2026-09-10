import { Action, Name } from '@wharfkit/antelope';
import { untrack } from 'svelte';
import type { UnicoveContext } from '$lib/state/client.svelte';
import type { SentimentStatistics, VoteMetrics } from '$lib/types/sentiment';
import {
	BURST_MS,
	BURST_TIMEOUT_MS,
	IDLE_MS,
	applyOwnVote,
	approvalsPath,
	detailPath,
	emptyMetrics,
	fetchDetail,
	isApprovalReconciled,
	isVoteReconciled,
	parseApprovalSnapshot,
	serializeStatistics,
	type DetailResponse,
	type ExpectedApproval,
	type MsigApprovalSnapshot,
	type RawStatistics,
	type SentimentTarget
} from './poll';

export const POLL_CONTEXT = 'sentiment-poll';

export type SentimentPollBox = { readonly current: SentimentPollState | null };

export class SentimentPollState {
	readonly target: SentimentTarget;

	statistics = $state<SentimentStatistics | null>(null);
	ownVote = $state<number | null | undefined>(undefined);
	ownWeight = $state<VoteMetrics | null>(null);
	expected = $state<{ vote: number | null } | null>(null);
	unreconciled = $state(false);
	approvals = $state<MsigApprovalSnapshot | null>(null);
	approvalsLoaded = $state(false);
	expectedApproval = $state<ExpectedApproval | null>(null);
	unreconciledApproval = $state(false);
	signing = $state(false);
	error = $state<string | null>(null);
	loadError = $state<string | null>(null);
	loaded = $state(false);
	version = $state(0);

	displayed = $derived.by(() => {
		if (!this.raw) return null;
		if (!this.expected) return this.statistics;
		const previous = this.indexedVote ?? null;
		return this.serialize(
			applyOwnVote(this.raw, previous, this.expected.vote, this.ownWeight ?? emptyMetrics())
		);
	});

	private raw = $state<RawStatistics | null>(null);
	private indexedVote = $state<number | null | undefined>(undefined);
	private context: UnicoveContext;
	private account: string | null = null;
	private timer: ReturnType<typeof setTimeout> | undefined;
	private running = false;
	private inFlight = false;
	private rerun = false;
	private burstStartedAt: number | null = null;
	private approvalBurstStartedAt: number | null = null;
	private weightGeneration = 0;
	private onVisibility = () => {
		if (document.hidden) {
			this.clearTimer();
		} else {
			void this.tick();
		}
	};

	constructor(context: UnicoveContext, target: SentimentTarget, initial?: DetailResponse) {
		this.context = context;
		this.target = target;
		if (initial) this.applyDetail(initial);
	}

	start() {
		if (this.running) return;
		this.running = true;
		document.addEventListener('visibilitychange', this.onVisibility);
		void this.tick();
	}

	stop() {
		this.running = false;
		this.rerun = false;
		this.clearTimer();
		document.removeEventListener('visibilitychange', this.onVisibility);
	}

	async refresh() {
		await this.poll();
	}

	dismissError() {
		this.loadError = null;
	}

	setAccount(name: string | null) {
		if (name === this.account) return;
		this.account = name;
		this.expected = null;
		this.unreconciled = false;
		this.burstStartedAt = null;
		this.ownVote = name ? undefined : null;
		this.indexedVote = name ? undefined : null;
		void this.loadWeight(name);
		if (this.running) void this.tick();
	}

	async vote(voteType: 0 | 1) {
		const voter = this.requireVoter();
		if (!voter) return;
		const action =
			this.target.kind === 'topic'
				? this.context.network.contracts.sentiment.action('votetopic', {
						voter,
						topic_id: Name.from(this.target.id),
						vote_type: voteType
					})
				: this.context.network.contracts.sentiment.action('votemsig', {
						voter,
						proposer: Name.from(this.target.proposer),
						proposal_name: Name.from(this.target.proposal),
						vote_type: voteType
					});
		await this.transact(action, voteType, 'Failed to vote');
	}

	async remove() {
		const voter = this.requireVoter();
		if (!voter) return;
		const action =
			this.target.kind === 'topic'
				? this.context.network.contracts.sentiment.action('rmtopicvote', {
						voter,
						topic_id: Name.from(this.target.id)
					})
				: this.context.network.contracts.sentiment.action('rmmsigvote', {
						voter,
						proposer: Name.from(this.target.proposer),
						proposal_name: Name.from(this.target.proposal)
					});
		await this.transact(action, null, 'Failed to remove vote');
	}

	signedApproval(level: string, provided: boolean) {
		if (this.target.kind !== 'msig') return;
		this.expectedApproval = { level, provided };
		this.unreconciledApproval = false;
		this.approvalBurstStartedAt = Date.now();
		if (this.running) void this.tick();
	}

	private requireVoter(): Name | null {
		if (!this.context.wharf.session || !this.context.account) return null;
		return this.context.account.name;
	}

	private async transact(action: Action, voteType: number | null, failure: string) {
		this.signing = true;
		this.error = null;
		try {
			await this.context.wharf.transact({ action });
			this.expected = { vote: voteType };
			this.ownVote = voteType;
			this.unreconciled = false;
			this.burstStartedAt = Date.now();
			if (this.running) void this.tick();
		} catch (e) {
			this.error = e instanceof Error ? e.message : failure;
			console.error('Vote error:', e);
		} finally {
			this.signing = false;
		}
	}

	private get bursting(): boolean {
		const now = Date.now();
		const vote = this.burstStartedAt !== null && now - this.burstStartedAt < BURST_TIMEOUT_MS;
		const approval =
			this.approvalBurstStartedAt !== null && now - this.approvalBurstStartedAt < BURST_TIMEOUT_MS;
		return vote || approval;
	}

	private clearTimer() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = undefined;
	}

	private schedule() {
		this.clearTimer();
		if (!this.running || document.hidden) return;
		this.timer = setTimeout(() => void this.tick(), this.bursting ? BURST_MS : IDLE_MS);
	}

	private async tick() {
		this.clearTimer();
		if (!this.running) return;
		if (this.inFlight) {
			this.rerun = true;
			return;
		}
		this.inFlight = true;
		try {
			await this.poll();
		} finally {
			this.inFlight = false;
			if (this.rerun) {
				this.rerun = false;
				void this.tick();
			} else {
				this.schedule();
			}
		}
	}

	private async poll() {
		const bursting = this.bursting;
		const carryVoter = this.account && (bursting || this.expected || this.ownVote === undefined);
		const bypass = bursting ? Date.now() : undefined;
		const base = this.context.urlPath('/api/sentiment');
		const requests: Promise<void>[] = [];
		if (this.context.network.supports('sentiment')) {
			requests.push(
				fetchDetail(
					this.context.network.fetch,
					detailPath(base, this.target, {
						voter: carryVoter ? this.account! : undefined,
						bypass
					})
				)
					.then((detail) => {
						this.loadError = null;
						this.applyDetail(detail, Boolean(carryVoter));
					})
					.catch((e) => {
						this.loadError = e instanceof Error ? e.message : 'Failed to load sentiment';
					})
			);
		}
		if (this.target.kind === 'msig') {
			const approvalBypass = this.expectedApproval ? Date.now() : undefined;
			requests.push(
				this.context.network
					.fetch(
						approvalsPath(this.context.urlPath('/api/msig'), this.target, {
							bypass: approvalBypass
						})
					)
					.then((response) => response.json())
					.then((json) => {
						const snapshot = parseApprovalSnapshot(json);
						if (snapshot) this.applyApprovals(snapshot);
						this.approvalsLoaded = true;
					})
					.catch(() => {
						this.approvalsLoaded = true;
					})
			);
		}
		await Promise.all(requests);
		this.expireBursts();
	}

	private applyDetail(detail: DetailResponse, requestedVoter = false) {
		this.raw = detail.statistics;
		this.statistics = this.serialize(detail.statistics);
		this.loaded = true;
		this.version += 1;
		if (detail.vote !== undefined) {
			this.indexedVote = detail.vote?.voteType ?? null;
			if (this.expected) {
				if (isVoteReconciled(this.expected.vote, detail.vote)) {
					this.expected = null;
					this.unreconciled = false;
					this.burstStartedAt = null;
					this.ownVote = this.indexedVote;
				}
			} else {
				this.ownVote = this.indexedVote;
			}
		} else if (requestedVoter && !this.expected && this.ownVote === undefined) {
			this.ownVote = null;
			this.indexedVote = null;
		}
	}

	private applyApprovals(snapshot: MsigApprovalSnapshot) {
		this.approvals = snapshot;
		if (this.expectedApproval && isApprovalReconciled(this.expectedApproval, snapshot)) {
			this.expectedApproval = null;
			this.unreconciledApproval = false;
			this.approvalBurstStartedAt = null;
		}
	}

	private expireBursts() {
		const now = Date.now();
		if (
			this.expected &&
			this.burstStartedAt !== null &&
			now - this.burstStartedAt >= BURST_TIMEOUT_MS
		) {
			this.unreconciled = true;
			this.burstStartedAt = null;
		}
		if (
			this.expectedApproval &&
			this.approvalBurstStartedAt !== null &&
			now - this.approvalBurstStartedAt >= BURST_TIMEOUT_MS
		) {
			this.unreconciledApproval = true;
			this.approvalBurstStartedAt = null;
		}
	}

	private async loadWeight(name: string | null) {
		const generation = ++this.weightGeneration;
		if (!name) {
			this.ownWeight = null;
			return;
		}
		try {
			const result = await this.context.network.contracts.sentiment.readonly('getmetric', {
				voter: Name.from(name)
			});
			if (generation !== this.weightGeneration) return;
			const staked = Number(result.system_staked);
			const liquid = Number(result.system_liquid);
			const vStaked = Number(result.v_staked);
			const vLiquid = Number(result.v_liquid);
			this.ownWeight = {
				system: { total: staked + liquid, staked, liquid },
				ram: { total: Number(result.ram_bytes) },
				v: { total: vStaked + vLiquid, staked: vStaked, liquid: vLiquid }
			};
		} catch {
			if (generation === this.weightGeneration) this.ownWeight = null;
		}
	}

	private serialize(raw: RawStatistics): SentimentStatistics {
		const symbol = this.context.network.chain.systemToken?.symbol;
		if (!symbol) {
			throw new Error('network systemToken is not configured');
		}
		return serializeStatistics(raw, symbol);
	}
}

export function mountSentimentPoll(
	context: UnicoveContext,
	getTarget: () => SentimentTarget | null,
	options: { live?: () => boolean; initial?: () => DetailResponse | undefined } = {}
): SentimentPollBox {
	const box = $state<{ current: SentimentPollState | null }>({ current: null });
	const accountName = () => (context.account ? String(context.account.name) : null);

	$effect(() => {
		const target = getTarget();
		const live = options.live ? options.live() : true;
		if (!target || (target.kind === 'topic' && !context.network.supports('sentiment'))) {
			box.current = null;
			return;
		}
		const poll = new SentimentPollState(context, target, options.initial?.());
		poll.setAccount(untrack(accountName));
		box.current = poll;
		if (live) {
			poll.start();
		} else {
			void poll.refresh();
		}
		return () => {
			poll.stop();
			box.current = null;
		};
	});

	$effect(() => {
		box.current?.setAccount(accountName());
	});

	return box;
}
