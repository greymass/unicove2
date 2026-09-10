import {
	DiscussionUnavailable,
	fetchMessages,
	resolveEmptyQuery,
	type Message
} from '$lib/msg/api';
import { anyHasMore, earlierCursors } from './cursor';
import type { PostFields } from '$lib/msg/content';
import { tupleKey, type Tuple } from '$lib/msg/model';
import { mergeMessages, newestSeq, pendingComment, type Comment } from '$lib/msg/reconcile';

const PAGE = 50;
const CONFIRM_MS = 2000;
const PENDING_TIMEOUT_MS = 60000;

export class ThreadState {
	comments = $state<Comment[]>([]);
	loading = $state(false);
	unavailable = $state(false);
	error = $state<string | null>(null);
	hasMore = $state(false);
	ready = $state(false);

	private hasMoreByTuple = new Map<string, boolean>();
	private busy = false;
	private earlierInFlight = false;
	private confirmTimer: ReturnType<typeof setInterval> | undefined;

	constructor(
		private fetchFn: typeof fetch,
		private apiBase: string,
		private tuples: readonly Tuple[]
	) {}

	private async query(
		build: (tuple: Tuple) => Parameters<typeof fetchMessages>[2],
		probeIfEmpty: boolean
	) {
		if (this.tuples.length === 0) {
			return resolveEmptyQuery<{ messages: Message[]; has_more: boolean }>(
				this.fetchFn,
				this.apiBase,
				probeIfEmpty
			);
		}
		const pages = await Promise.all(
			this.tuples.map((tuple) => fetchMessages(this.fetchFn, this.apiBase, build(tuple)))
		);
		return pages;
	}

	private recordHasMore(pages: readonly { has_more: boolean }[]) {
		this.tuples.forEach((tuple, i) => this.hasMoreByTuple.set(tupleKey(tuple), pages[i].has_more));
		this.hasMore = anyHasMore(this.hasMoreByTuple, this.tuples);
	}

	async load() {
		this.loading = true;
		this.error = null;
		this.busy = true;
		try {
			const pages = await this.query((tuple) => ({ tuple, limit: PAGE }), true);
			this.comments = mergeMessages(
				[],
				pages.flatMap((p) => p.messages)
			);
			this.recordHasMore(pages);
			this.unavailable = false;
			this.ready = true;
		} catch (e) {
			this.fail(e);
		} finally {
			this.loading = false;
			this.busy = false;
		}
	}

	async loadEarlier() {
		if (this.earlierInFlight) return;
		const cursors = earlierCursors(this.comments, this.tuples, this.hasMoreByTuple);
		if (cursors.length === 0) return;
		this.earlierInFlight = true;
		this.busy = true;
		try {
			const pages = await Promise.all(
				cursors.map(({ tuple, before }) =>
					fetchMessages(
						this.fetchFn,
						this.apiBase,
						before === undefined ? { tuple, limit: PAGE } : { tuple, limit: PAGE, before }
					)
				)
			);
			this.comments = mergeMessages(
				this.comments,
				pages.flatMap((p) => p.messages)
			);
			cursors.forEach(({ tuple }, i) =>
				this.hasMoreByTuple.set(tupleKey(tuple), pages[i].has_more)
			);
			this.hasMore = anyHasMore(this.hasMoreByTuple, this.tuples);
		} catch (e) {
			this.fail(e);
		} finally {
			this.earlierInFlight = false;
			this.busy = false;
		}
	}

	async refresh() {
		try {
			const pages = await this.query(
				(tuple) => ({ tuple, limit: PAGE, includeDeleted: true }),
				true
			);
			this.comments = mergeMessages(
				this.comments,
				pages.flatMap((p) => p.messages)
			);
			this.recordHasMore(pages);
			this.unavailable = false;
			this.error = null;
			this.ready = true;
		} catch (e) {
			this.fail(e);
		}
	}

	addPending(sender: string, fields: PostFields, trxId: string) {
		this.comments = [...this.comments, pendingComment(sender, fields, trxId, Date.now())];
		this.confirmTimer ??= setInterval(() => this.confirm(), CONFIRM_MS);
	}

	stop() {
		clearInterval(this.confirmTimer);
		this.confirmTimer = undefined;
	}

	private async confirm() {
		if (this.busy) return;
		const after = newestSeq(this.comments);
		try {
			const pages = await this.query((tuple) => ({ tuple, limit: PAGE, after }), false);
			this.comments = mergeMessages(
				this.comments,
				pages.flatMap((p) => p.messages)
			);
			this.error = null;
		} catch (e) {
			this.fail(e);
		}
		this.expirePending();
		if (!this.comments.some((c) => c.pending?.phase === 'confirming')) this.stop();
	}

	markDeleted(seq: number) {
		this.comments = this.comments.map((c) => (c.seq === seq ? { ...c, deleted: true } : c));
	}

	applyEdit(seq: number, body: string) {
		const now = new Date().toISOString().replace('Z', '');
		this.comments = this.comments.map((c) => (c.seq === seq ? { ...c, body, edited_at: now } : c));
	}

	private expirePending() {
		const now = Date.now();
		this.comments = this.comments.map((c) =>
			c.pending && c.pending.phase === 'confirming' && now - c.pending.since > PENDING_TIMEOUT_MS
				? { ...c, pending: { ...c.pending, phase: 'awaiting' } }
				: c
		);
	}

	private fail(e: unknown) {
		this.ready = true;
		if (e instanceof DiscussionUnavailable) {
			this.unavailable = true;
			return;
		}
		this.error = e instanceof Error ? e.message : String(e);
	}
}
