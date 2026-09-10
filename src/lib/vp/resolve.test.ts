import { describe, expect, test } from 'bun:test';
import { findVpSummary, normalizeVpRef, selectVpFile } from './resolve';
import { parseVpIndex } from './types';
import fixture from './fixtures/index.json';

const index = parseVpIndex(fixture);

describe('normalizeVpRef', () => {
	test('accepts the canonical number form', () => {
		expect(normalizeVpRef('vp-0001')).toBe('vp-0001');
	});

	test('is case insensitive', () => {
		expect(normalizeVpRef('VP-0001')).toBe('vp-0001');
	});

	test('accepts a full directory slug', () => {
		expect(normalizeVpRef('vp-0001-ram-gifting')).toBe('vp-0001');
	});

	test('rejects nonsense', () => {
		expect(normalizeVpRef('hello')).toBeNull();
		expect(normalizeVpRef('vp-1')).toBeNull();
	});
});

describe('findVpSummary', () => {
	test('finds by number', () => {
		expect(findVpSummary(index, 'vp-0001')?.vp).toBe('VP-0001');
	});

	test('finds by slug', () => {
		expect(findVpSummary(index, 'vp-0001-ram-gifting')?.vp).toBe('VP-0001');
	});

	test('is case insensitive on the slugged form', () => {
		expect(findVpSummary(index, 'VP-0001-RAM-Gifting')?.vp).toBe('VP-0001');
	});

	test('returns undefined for an unknown number', () => {
		expect(findVpSummary(index, 'vp-9999')).toBeUndefined();
	});

	test('returns undefined for a wrong suffix', () => {
		expect(findVpSummary(index, 'vp-0001-wrong-suffix')).toBeUndefined();
	});

	test('returns undefined for another proposal slug on this number', () => {
		expect(findVpSummary(index, 'vp-0001-account-creation')).toBeUndefined();
	});
});

describe('selectVpFile', () => {
	const summary = findVpSummary(index, 'vp-0001')!;

	test('serves English by default', () => {
		const picked = selectVpFile(summary, 'en');
		expect(picked.lang).toBe('en');
		expect(picked.path).toBe(summary.path);
		expect(picked.stale).toBe(false);
	});

	test('serves a translation when the locale has one', () => {
		const picked = selectVpFile(summary, 'ko');
		expect(picked.lang).toBe('ko');
		expect(picked.path).toContain('proposal.ko.md');
	});

	test('falls back to English for a locale with no translation', () => {
		const picked = selectVpFile(summary, 'fr');
		expect(picked.lang).toBe('en');
	});

	test('marks a stale translation', () => {
		const stale = {
			...summary,
			translations: [{ lang: 'ko', path: 'proposals/x/proposal.ko.md', current: false, msigs: [] }]
		};
		expect(selectVpFile(stale, 'ko').stale).toBe(true);
	});

	test('ignores en translation entries and serves base document', () => {
		const withEnTranslation = {
			...summary,
			translations: [{ lang: 'en', path: 'proposals/x/proposal.en.md', current: true, msigs: [] }]
		};
		const picked = selectVpFile(withEnTranslation, 'en');
		expect(picked.lang).toBe('en');
		expect(picked.path).toBe(summary.path);
		expect(picked.stale).toBe(false);
	});
});
