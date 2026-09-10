import { describe, expect, test } from 'bun:test';
import {
	MAX_BODY_BYTES,
	checkBody,
	forumAccountFor,
	hookAccountFor,
	normalizeBody,
	targetFromTags,
	titleFor,
	tupleEquals,
	tupleFor,
	tupleKey
} from './model';

describe('tuples', () => {
	test('msig target maps to an ordered tuple', () => {
		expect(tupleFor({ kind: 'msig', proposer: 'greymass', proposal: 'vp42' })).toEqual([
			'msig',
			'greymass',
			'vp42'
		]);
	});
	test('topic target maps to an ordered tuple', () => {
		expect(tupleFor({ kind: 'topic', contract: 'sentiment.gm', topic: 'vp42' })).toEqual([
			'topic',
			'sentiment.gm',
			'vp42'
		]);
	});
	test('tags parse back to a target and ignore a fourth tag', () => {
		expect(targetFromTags(['msig', 'greymass', 'vp42', 'extra'])).toEqual({
			kind: 'msig',
			proposer: 'greymass',
			proposal: 'vp42'
		});
		expect(targetFromTags(['topic', 'sentiment.gm', 'vp42'])).toEqual({
			kind: 'topic',
			contract: 'sentiment.gm',
			topic: 'vp42'
		});
	});
	test('unknown kind, short tuples, and missing tags are null', () => {
		expect(targetFromTags(['poll', 'a', 'b'])).toBeNull();
		expect(targetFromTags(['msig', 'a'])).toBeNull();
		expect(targetFromTags(undefined)).toBeNull();
	});
	test('tupleEquals compares the first three tags in order', () => {
		expect(tupleEquals(['msig', 'a', 'b'], ['msig', 'a', 'b', 'x'])).toBe(true);
		expect(tupleEquals(['msig', 'a', 'b'], ['msig', 'b', 'a'])).toBe(false);
		expect(tupleEquals(['msig', 'a'], ['msig', 'a', 'b'])).toBe(false);
	});
	test('tupleKey and titleFor', () => {
		expect(tupleKey(['msig', 'greymass', 'vp42'])).toBe('msig:greymass:vp42');
		expect(titleFor({ kind: 'msig', proposer: 'greymass', proposal: 'vp42' })).toBe(
			'msig greymass/vp42'
		);
		expect(titleFor({ kind: 'topic', contract: 'sentiment.gm', topic: 'vp42' })).toBe(
			'topic sentiment.gm/vp42'
		);
	});
});

describe('account derivation', () => {
	test('forum and hook accounts follow the msg suffix', () => {
		expect(forumAccountFor('msg')).toBe('forum.msg');
		expect(forumAccountFor('msg.gm')).toBe('forum.gm');
		expect(hookAccountFor('tokenreq', 'msg')).toBe('tokenreq.msg');
		expect(hookAccountFor('block', 'msg.gm')).toBe('block.gm');
	});
});

describe('body rules', () => {
	test('normalizes CRLF and tabs', () => {
		expect(normalizeBody('a\r\nb\tc\r')).toBe('a\nb    c\n');
	});
	test('folds U+2028 line separator and U+2029 paragraph separator to newlines', () => {
		expect(normalizeBody('a\u2028b')).toBe('a\nb');
		expect(normalizeBody('a\u2029b')).toBe('a\nb');
	});
	test('folds line and paragraph separators alongside CRLF', () => {
		expect(normalizeBody('a\u2028\r\nb\u2029c')).toBe('a\n\nb\nc');
	});
	test('rejects empty and whitespace bodies', () => {
		expect(checkBody('')).toEqual({ ok: false, reason: 'empty', bytes: 0 });
		expect(checkBody('  \n\n')).toMatchObject({ ok: false, reason: 'empty' });
	});
	test('rejects bidi controls with the reason', () => {
		expect(checkBody('file‮txt.exe')).toMatchObject({ ok: false, reason: 'bidi' });
		expect(checkBody('x⁦y')).toMatchObject({ ok: false, reason: 'bidi' });
	});
	test('counts UTF-8 bytes and enforces the cap', () => {
		expect(checkBody('héllo')).toEqual({ ok: true, bytes: 6 });
		expect(checkBody('a'.repeat(MAX_BODY_BYTES))).toEqual({ ok: true, bytes: MAX_BODY_BYTES });
		expect(checkBody('a'.repeat(MAX_BODY_BYTES + 1))).toMatchObject({
			ok: false,
			reason: 'too_long'
		});
	});
	test('zero-width characters are allowed', () => {
		expect(checkBody('a​b').ok).toBe(true);
	});
});
