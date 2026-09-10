import { describe, expect, test } from 'bun:test';
import { parseVpIndex } from './types';
import fixture from './fixtures/index.json';

describe('parseVpIndex', () => {
	test('accepts the real index', () => {
		const index = parseVpIndex(fixture);
		expect(index.proposals.length).toBeGreaterThan(0);
		expect(index.proposals[0].vp).toMatch(/^VP-\d{4}$/);
	});

	test('exposes translations with a current flag', () => {
		const index = parseVpIndex(fixture);
		const withTranslations = index.proposals.find((p) => p.translations.length > 0);
		expect(withTranslations).toBeDefined();
		expect(typeof withTranslations!.translations[0].current).toBe('boolean');
	});

	test('rejects a non-object', () => {
		expect(() => parseVpIndex('nope')).toThrow();
	});

	test('rejects a missing proposals array', () => {
		expect(() => parseVpIndex({ generated: '2026-01-01' })).toThrow();
	});

	test('skips an entry with an unknown status and keeps the rest', () => {
		const raw = {
			generated: '2026-01-01',
			proposals: [{ ...fixture.proposals[0], status: 'Bogus' }, fixture.proposals[1]]
		};
		const index = parseVpIndex(raw);
		expect(index.proposals.map((p) => p.vp)).toEqual([fixture.proposals[1].vp]);
		expect(index.skipped).toBe(1);
	});

	test('skips an entry with a malformed vp number', () => {
		const raw = {
			generated: '2026-01-01',
			proposals: [{ ...fixture.proposals[0], vp: 'VP-1' }, fixture.proposals[1]]
		};
		const index = parseVpIndex(raw);
		expect(index.proposals).toHaveLength(1);
		expect(index.skipped).toBe(1);
	});

	test('reports no skips for a clean index', () => {
		expect(parseVpIndex(fixture).skipped).toBe(0);
	});

	test('excerpt fields parse when present and stay optional when absent', () => {
		const index = parseVpIndex(fixture);
		const withExcerpt = index.proposals.find((p) => p.vp === 'VP-0001');
		const without = index.proposals.find((p) => p.vp === 'VP-0002');
		expect(withExcerpt?.excerpt).toContain('network-owned account');
		expect(withExcerpt?.translations.find((t) => t.lang === 'ko')?.title).toBe(
			'계정 온보딩을 위한 네트워크 RAM 기금'
		);
		expect(without?.excerpt).toBeUndefined();
		expect(index.skipped).toBe(0);
	});

	test('parses a documents array with per-document translations', () => {
		const index = parseVpIndex(fixture);
		const multi = index.proposals.find((p) => p.vp === 'VP-0003');
		expect(multi?.documents.map((d) => d.path.split('/').pop())).toEqual([
			'msig-5.md',
			'rfp-framework.md',
			'rfp-platform-prd.md'
		]);
		expect(multi?.documents[0].heading).toContain('MSIG #5');
		expect(multi?.documents[0].translations).toEqual([]);
	});

	test('defaults documents to an empty array when the key is absent', () => {
		const index = parseVpIndex(fixture);
		const single = index.proposals.find((p) => p.vp === 'VP-0001');
		expect(single?.documents).toEqual([]);
	});
});
