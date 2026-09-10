import { describe, expect, test } from 'bun:test';
import { anyHasMore, earlierCursors, oldestSeqForTuple } from './cursor';
import type { Comment } from '$lib/msg/reconcile';
import type { Tuple } from '$lib/msg/model';

const chattyTuple: Tuple = ['msig', 'greymass', 'chatty'];
const quietTuple: Tuple = ['topic', 'sentiment.gm', 'quiet'];

function comment(seq: number, tuple: Tuple, overrides: Partial<Comment> = {}): Comment {
	return {
		seq,
		block_num: seq,
		timestamp: '2026-01-01T00:00:00',
		sender: 'aaron',
		channel: 'governance',
		content: '',
		tags: [...tuple],
		...overrides
	};
}

describe('oldestSeqForTuple', () => {
	test('finds the minimum non-pending seq belonging to the tuple', () => {
		const comments = [comment(10, chattyTuple), comment(5, chattyTuple), comment(3, quietTuple)];
		expect(oldestSeqForTuple(comments, chattyTuple)).toBe(5);
		expect(oldestSeqForTuple(comments, quietTuple)).toBe(3);
	});

	test('ignores pending comments and comments for other tuples', () => {
		const comments = [
			comment(10, chattyTuple, { pending: { trx_id: 't', phase: 'confirming', since: 0 } }),
			comment(20, quietTuple)
		];
		expect(oldestSeqForTuple(comments, chattyTuple)).toBeUndefined();
	});

	test('returns undefined when the tuple has no loaded messages', () => {
		expect(oldestSeqForTuple([], chattyTuple)).toBeUndefined();
	});
});

describe('earlierCursors', () => {
	test('gives each tuple its own before, so a quiet tuple owning the merged oldest seq does not clip a chattier tuple', () => {
		const comments = [
			comment(100, chattyTuple),
			comment(90, chattyTuple),
			comment(80, chattyTuple),
			comment(1, quietTuple)
		];
		const cursors = earlierCursors(comments, [chattyTuple, quietTuple], new Map());
		expect(cursors).toEqual([
			{ tuple: chattyTuple, before: 80 },
			{ tuple: quietTuple, before: 1 }
		]);
	});

	test('skips a tuple whose has_more is already false', () => {
		const comments = [comment(80, chattyTuple), comment(1, quietTuple)];
		const hasMore = new Map([
			['msig:greymass:chatty', false],
			['topic:sentiment.gm:quiet', true]
		]);
		const cursors = earlierCursors(comments, [chattyTuple, quietTuple], hasMore);
		expect(cursors).toEqual([{ tuple: quietTuple, before: 1 }]);
	});

	test('a tuple with no recorded has_more is queried by default', () => {
		const cursors = earlierCursors([], [chattyTuple], new Map());
		expect(cursors).toEqual([{ tuple: chattyTuple, before: undefined }]);
	});
});

describe('anyHasMore', () => {
	test('stays true while any tuple still has more', () => {
		const hasMore = new Map([
			['msig:greymass:chatty', false],
			['topic:sentiment.gm:quiet', true]
		]);
		expect(anyHasMore(hasMore, [chattyTuple, quietTuple])).toBe(true);
	});

	test('is false once every tuple is exhausted', () => {
		const hasMore = new Map([
			['msig:greymass:chatty', false],
			['topic:sentiment.gm:quiet', false]
		]);
		expect(anyHasMore(hasMore, [chattyTuple, quietTuple])).toBe(false);
	});
});
