import { describe, expect, test } from 'bun:test';
import type { Message } from './api';
import {
	commentKey,
	mergeMessages,
	newestSeq,
	oldestSeq,
	pendingComment,
	visibleComments,
	type Comment
} from './reconcile';

function msg(seq: number, sender: string, body: string, extra: Partial<Message> = {}): Message {
	return {
		seq,
		block_num: 1,
		timestamp: '2026-08-26T00:00:00.000',
		sender,
		channel: 'governance',
		content: '',
		title: 'msig a/b',
		body,
		tags: ['msig', 'a', 'b'],
		...extra
	};
}

const fields = { title: 'msig a/b', body: 'hello', tags: ['msig', 'a', 'b'] };

describe('mergeMessages', () => {
	test('inserts new messages in seq order and replaces existing seqs', () => {
		const current: Comment[] = [msg(2, 'x', 'two'), msg(4, 'y', 'four')];
		const merged = mergeMessages(current, [
			msg(3, 'z', 'three'),
			msg(4, 'y', 'four edited', { edited_at: 't' })
		]);
		expect(merged.map((m) => m.seq)).toEqual([2, 3, 4]);
		expect(merged[2].body).toBe('four edited');
		expect(merged[2].edited_at).toBe('t');
	});
	test('replaces a pending comment when sender and body match', () => {
		const pending = pendingComment('alice', fields, 'abc', 1000);
		const merged = mergeMessages([pending], [msg(9, 'alice', 'hello')]);
		expect(merged).toHaveLength(1);
		expect(merged[0].seq).toBe(9);
		expect(merged[0].pending).toBeUndefined();
	});
	test('a pending comment keeps its rendering identity once indexed', () => {
		const pending = pendingComment('alice', fields, 'abc', 1000);
		const keyBefore = commentKey(pending);
		const merged = mergeMessages([pending], [msg(9, 'alice', 'hello')]);
		expect(merged[0].seq).toBe(9);
		expect(commentKey(merged[0])).toBe(keyBefore);
	});
	test('the indexed comment keeps its rendering identity across a later refresh', () => {
		const pending = pendingComment('alice', fields, 'abc', 1000);
		const keyBefore = commentKey(pending);
		const indexed = msg(9, 'alice', 'hello');
		const firstMerge = mergeMessages([pending], [indexed]);
		const refreshed = mergeMessages(firstMerge, [indexed]);
		expect(refreshed[0].seq).toBe(9);
		expect(commentKey(refreshed[0])).toBe(keyBefore);
	});
	test('keeps a pending comment when only the sender matches', () => {
		const pending = pendingComment('alice', fields, 'abc', 1000);
		const merged = mergeMessages([pending], [msg(9, 'alice', 'other')]);
		expect(merged).toHaveLength(2);
		expect(merged.some((m) => m.pending)).toBe(true);
	});
	test('pending comments sort after indexed ones', () => {
		const pending = pendingComment('alice', fields, 'abc', 1000);
		const merged = mergeMessages([pending], [msg(9, 'bob', 'x')]);
		expect(merged[0].seq).toBe(9);
		expect(merged[1].pending).toBeDefined();
	});
	test('a deleted message replaces its live copy', () => {
		const merged = mergeMessages([msg(5, 'x', 'gone')], [msg(5, 'x', '', { deleted: true })]);
		expect(merged[0].deleted).toBe(true);
	});
	test('system messages are ignored', () => {
		expect(mergeMessages([], [msg(1, 'msg', 'created this channel', { type: 'system' })])).toEqual(
			[]
		);
	});
});

describe('pendingComment', () => {
	test('carries the fields, a negative placeholder seq, and confirming phase', () => {
		const c = pendingComment('alice', fields, 'abc', 1000);
		expect(c.sender).toBe('alice');
		expect(c.body).toBe('hello');
		expect(c.tags).toEqual(['msig', 'a', 'b']);
		expect(c.seq).toBeLessThan(0);
		expect(c.pending).toEqual({ trx_id: 'abc', phase: 'confirming', since: 1000 });
	});
});

describe('helpers', () => {
	test('visibleComments drops deleted rows', () => {
		const list: Comment[] = [msg(1, 'a', 'x'), msg(2, 'b', '', { deleted: true })];
		expect(visibleComments(list).map((m) => m.seq)).toEqual([1]);
	});
	test('newest and oldest ignore pending rows', () => {
		const list: Comment[] = [
			msg(3, 'a', 'x'),
			msg(7, 'b', 'y'),
			pendingComment('c', fields, 't', 1)
		];
		expect(newestSeq(list)).toBe(7);
		expect(oldestSeq(list)).toBe(3);
		expect(newestSeq([])).toBeUndefined();
	});
});
