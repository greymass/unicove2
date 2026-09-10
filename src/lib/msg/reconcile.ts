import type { Message } from './api';
import type { PostFields } from './content';
import { GOVERNANCE_CHANNEL } from './model';

export interface PendingMeta {
	trx_id: string;
	phase: 'confirming' | 'awaiting';
	since: number;
}

export type Comment = Message & { pending?: PendingMeta; key?: number };

let placeholder = -1;

export function commentKey(c: Comment): number {
	return c.key ?? c.seq;
}

export function pendingComment(
	sender: string,
	fields: PostFields,
	trxId: string,
	now: number
): Comment {
	const seq = placeholder--;
	return {
		seq,
		key: seq,
		block_num: 0,
		timestamp: new Date(now).toISOString(),
		sender,
		channel: GOVERNANCE_CHANNEL,
		content: '',
		title: fields.title,
		body: fields.body,
		tags: [...fields.tags],
		pending: { trx_id: trxId, phase: 'confirming', since: now }
	};
}

function order(a: Comment, b: Comment): number {
	if (a.pending && b.pending) return a.pending.since - b.pending.since;
	if (a.pending) return 1;
	if (b.pending) return -1;
	return a.seq - b.seq;
}

export function mergeMessages(current: Comment[], incoming: Message[]): Comment[] {
	const bySeq = new Map<number, Comment>();
	const pending: Comment[] = [];
	for (const c of current) {
		if (c.pending) pending.push(c);
		else bySeq.set(c.seq, c);
	}
	for (const m of incoming) {
		if (m.type === 'system') continue;
		const matched = pending.findIndex((p) => p.sender === m.sender && p.body === m.body);
		const key = matched !== -1 ? commentKey(pending[matched]) : (bySeq.get(m.seq)?.key ?? m.seq);
		bySeq.set(m.seq, { ...m, key });
		if (matched !== -1) pending.splice(matched, 1);
	}
	return [...bySeq.values(), ...pending].sort(order);
}

export function visibleComments(comments: Comment[]): Comment[] {
	return comments.filter((c) => !c.deleted);
}

export function newestSeq(comments: Comment[]): number | undefined {
	let seq: number | undefined;
	for (const c of comments) if (!c.pending && (seq === undefined || c.seq > seq)) seq = c.seq;
	return seq;
}

export function oldestSeq(comments: Comment[]): number | undefined {
	let seq: number | undefined;
	for (const c of comments) if (!c.pending && (seq === undefined || c.seq < seq)) seq = c.seq;
	return seq;
}
