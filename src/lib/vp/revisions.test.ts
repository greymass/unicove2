import { describe, expect, test } from 'bun:test';
import { mergeVpRevisions, parseVpRevisions, sortVpRevisionsNewestFirst } from './revisions';

const fixture = await Bun.file(new URL('./fixtures/proposal.md', import.meta.url).pathname).text();

const withRevisions = `---
vp: VP-9999
title: Example
standard: VPS-1
status: Draft
authors:
    - Someone
created: 2026-08-02
accounts: []
msigs: []
sentiment: []
requires: []
revisions:
    - version: 1
      date: 2026-08-02
      summary: Initial draft.
    - version: 2
      date: 2026-08-11
      summary: Raised creator admission to a 15/21 BP MSIG.
---

# Example
`;

describe('parseVpRevisions', () => {
	test('parses a valid revisions list', () => {
		const revisions = parseVpRevisions(withRevisions);
		expect(revisions).toEqual([
			{ version: 1, date: '2026-08-02', summary: 'Initial draft.' },
			{ version: 2, date: '2026-08-11', summary: 'Raised creator admission to a 15/21 BP MSIG.' }
		]);
	});

	test('a document with no revisions key yields no revisions', () => {
		expect(parseVpRevisions(fixture)).toEqual([]);
	});

	test('a document with no frontmatter yields no revisions', () => {
		expect(parseVpRevisions('# Title\n\nBody.\n')).toEqual([]);
	});

	test('malformed YAML yields no revisions, not a throw', () => {
		const raw = '---\nrevisions: [\n---\n\n# Title\n';
		expect(() => parseVpRevisions(raw)).not.toThrow();
		expect(parseVpRevisions(raw)).toEqual([]);
	});

	test('a revisions value that is not a list yields no revisions', () => {
		const raw = '---\nrevisions: "not a list"\n---\n\n# Title\n';
		expect(parseVpRevisions(raw)).toEqual([]);
	});

	test('an entry missing required fields yields no revisions', () => {
		const raw = '---\nrevisions:\n    - version: 1\n---\n\n# Title\n';
		expect(parseVpRevisions(raw)).toEqual([]);
	});

	test('an entry with a non-numeric version yields no revisions', () => {
		const raw = `---
revisions:
    - version: one
      date: 2026-08-02
      summary: Initial draft.
---

# Title
`;
		expect(parseVpRevisions(raw)).toEqual([]);
	});

	test('a version below 1 yields no revisions', () => {
		const raw = `---
revisions:
    - version: 0
      date: 2026-08-02
      summary: Initial draft.
---

# Title
`;
		expect(parseVpRevisions(raw)).toEqual([]);
	});

	test('a negative version yields no revisions', () => {
		const raw = `---
revisions:
    - version: -1
      date: 2026-08-02
      summary: Initial draft.
---

# Title
`;
		expect(parseVpRevisions(raw)).toEqual([]);
	});

	test('duplicate versions yield no revisions, guaranteeing keyed-each uniqueness', () => {
		const raw = `---
revisions:
    - version: 1
      date: 2026-08-02
      summary: Initial draft.
    - version: 1
      date: 2026-08-11
      summary: A second entry claiming the same version.
---

# Title
`;
		expect(parseVpRevisions(raw)).toEqual([]);
	});
});

describe('mergeVpRevisions', () => {
	const english = [
		{ version: 1, date: '2026-08-02', summary: 'Initial draft.' },
		{ version: 2, date: '2026-08-11', summary: 'Raised the threshold.' }
	];

	test('matching lists produce localized summaries', () => {
		const localized = [
			{ version: 1, date: '2026-08-02', summary: '초안.' },
			{ version: 2, date: '2026-08-11', summary: '기준을 높였습니다.' }
		];
		expect(mergeVpRevisions(english, localized)).toEqual([
			{ version: 1, date: '2026-08-02', summary: '초안.' },
			{ version: 2, date: '2026-08-11', summary: '기준을 높였습니다.' }
		]);
	});

	test('a stale localized list missing a later entry falls back to English for it', () => {
		const localized = [{ version: 1, date: '2026-08-02', summary: '초안.' }];
		expect(mergeVpRevisions(english, localized)).toEqual([
			{ version: 1, date: '2026-08-02', summary: '초안.' },
			{ version: 2, date: '2026-08-11', summary: 'Raised the threshold.' }
		]);
	});

	test('an empty localized summary falls back to English', () => {
		const localized = [
			{ version: 1, date: '2026-08-02', summary: '' },
			{ version: 2, date: '2026-08-11', summary: '기준을 높였습니다.' }
		];
		expect(mergeVpRevisions(english, localized)).toEqual([
			{ version: 1, date: '2026-08-02', summary: 'Initial draft.' },
			{ version: 2, date: '2026-08-11', summary: '기준을 높였습니다.' }
		]);
	});

	test('matching happens by version, not position', () => {
		const localized = [
			{ version: 2, date: '2026-08-11', summary: '기준을 높였습니다.' },
			{ version: 1, date: '2026-08-02', summary: '초안.' }
		];
		expect(mergeVpRevisions(english, localized)).toEqual([
			{ version: 1, date: '2026-08-02', summary: '초안.' },
			{ version: 2, date: '2026-08-11', summary: '기준을 높였습니다.' }
		]);
	});

	test('an early missing entry still pairs the rest by version', () => {
		const threeVersionEnglish = [
			{ version: 1, date: '2026-08-02', summary: 'Initial draft.' },
			{ version: 2, date: '2026-08-05', summary: 'Second revision.' },
			{ version: 3, date: '2026-08-11', summary: 'Third revision.' }
		];
		const localized = [
			{ version: 3, date: '2026-08-11', summary: '세번째.' },
			{ version: 2, date: '2026-08-05', summary: '두번째.' }
		];
		expect(mergeVpRevisions(threeVersionEnglish, localized)).toEqual([
			{ version: 1, date: '2026-08-02', summary: 'Initial draft.' },
			{ version: 2, date: '2026-08-05', summary: '두번째.' },
			{ version: 3, date: '2026-08-11', summary: '세번째.' }
		]);
	});
});

describe('sortVpRevisionsNewestFirst', () => {
	test('orders by descending version', () => {
		const revisions = [
			{ version: 1, date: '2026-08-02', summary: 'a' },
			{ version: 3, date: '2026-08-11', summary: 'c' },
			{ version: 2, date: '2026-08-05', summary: 'b' }
		];
		expect(sortVpRevisionsNewestFirst(revisions).map((r) => r.version)).toEqual([3, 2, 1]);
	});
});
