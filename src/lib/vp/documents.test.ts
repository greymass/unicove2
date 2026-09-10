import { describe, expect, test } from 'bun:test';
import {
	buildVpToc,
	findVpDocument,
	prepareVpExhibit,
	selectVpDocumentFile,
	vpDocumentHeading,
	vpDocumentLabel,
	vpDocumentStem
} from './documents';
import type { VpDocumentRef } from './types';

const framework: VpDocumentRef = {
	path: 'proposals/vp-0003-rfp-program/documents/rfp-framework.md',
	heading: 'Vaulta Network RFP Framework',
	translations: [
		{
			lang: 'ko',
			path: 'proposals/vp-0003-rfp-program/documents/rfp-framework.ko.md',
			current: false,
			heading: 'Vaulta RFP 프레임워크'
		}
	]
};

const prd: VpDocumentRef = {
	path: 'proposals/vp-0003-rfp-program/documents/rfp-platform-prd.md',
	heading: 'Vaulta RFP Platform — Product Requirements & Gap Analysis',
	translations: []
};

const headless: VpDocumentRef = {
	path: 'proposals/vp-0003-rfp-program/documents/msig-5.md',
	translations: []
};

describe('vpDocumentStem', () => {
	test('takes the filename without extension', () => {
		expect(vpDocumentStem(framework.path)).toBe('rfp-framework');
	});
});

describe('findVpDocument', () => {
	test('finds a document by stem', () => {
		expect(findVpDocument([framework, prd], 'rfp-platform-prd')).toBe(prd);
	});

	test('returns undefined for an unknown stem', () => {
		expect(findVpDocument([framework, prd], 'nope')).toBeUndefined();
	});
});

describe('vpDocumentHeading', () => {
	test('uses the index heading', () => {
		expect(vpDocumentHeading(framework)).toBe('Vaulta Network RFP Framework');
	});

	test('falls back to the stem when the index has no heading', () => {
		expect(vpDocumentHeading(headless)).toBe('msig-5');
	});
});

describe('vpDocumentLabel', () => {
	test('keeps a short heading whole', () => {
		expect(vpDocumentLabel(framework)).toBe('Vaulta Network RFP Framework');
	});

	test('cuts at an em dash separator', () => {
		expect(vpDocumentLabel(prd)).toBe('Vaulta RFP Platform');
	});

	test('cuts at a colon separator', () => {
		expect(
			vpDocumentLabel({
				path: 'documents/x.md',
				heading: 'Part One: The Long Subtitle Text',
				translations: []
			})
		).toBe('Part One');
	});

	test('truncates a long unbroken heading', () => {
		const label = vpDocumentLabel({
			path: 'documents/x.md',
			heading: 'A very long heading with no separator anywhere in it at all',
			translations: []
		});
		expect(label.length).toBeLessThanOrEqual(32);
		expect(label.endsWith('…')).toBe(true);
	});

	test('falls back to the stem without a heading', () => {
		expect(vpDocumentLabel(headless)).toBe('msig-5');
	});
});

describe('selectVpDocumentFile', () => {
	test('returns the English file for the English locale', () => {
		expect(selectVpDocumentFile(framework, 'en')).toEqual({
			path: framework.path,
			lang: 'en',
			stale: false
		});
	});

	test('returns a translation for its locale, flagging staleness', () => {
		expect(selectVpDocumentFile(framework, 'ko')).toEqual({
			path: 'proposals/vp-0003-rfp-program/documents/rfp-framework.ko.md',
			lang: 'ko',
			stale: true
		});
	});

	test('falls back to English when the locale has no translation', () => {
		expect(selectVpDocumentFile(prd, 'zh')).toEqual({ path: prd.path, lang: 'en', stale: false });
	});
});

describe('prepareVpExhibit', () => {
	const raw = [
		'# Vaulta Network RFP Framework',
		'',
		'**Exhibit A to MSIG #5**',
		'**Status: DRAFT v4.2**',
		'**Date: [___]**',
		'',
		'Intro paragraph here.',
		'',
		'# PART 1',
		'',
		'## Purpose',
		'',
		'Words words words.'
	].join('\n');

	test('takes the first h1 as the heading and drops it from the body', () => {
		const exhibit = prepareVpExhibit(raw);
		expect(exhibit.heading).toBe('Vaulta Network RFP Framework');
		expect(exhibit.body).not.toContain('# Vaulta Network RFP Framework');
	});

	test('keeps later h1s in the body', () => {
		expect(prepareVpExhibit(raw).body).toContain('# PART 1');
	});

	test('extracts the status line', () => {
		expect(prepareVpExhibit(raw).statusLine).toBe('DRAFT v4.2');
	});

	test('counts words and rounds reading time up to a minute', () => {
		const exhibit = prepareVpExhibit(raw);
		expect(exhibit.words).toBeGreaterThan(0);
		expect(exhibit.minutes).toBe(1);
	});

	test('ignores punctuation-only tokens like table pipes and rules', () => {
		const exhibit = prepareVpExhibit('# T\n\n| a | b |\n| --- | --- |\n| one | two |\n');
		expect(exhibit.words).toBe(4);
	});

	test('handles a translation with frontmatter and no status line', () => {
		const exhibit = prepareVpExhibit('---\nlang: ko\nsource: abc\n---\n\n# 제목\n\n본문.\n');
		expect(exhibit.heading).toBe('제목');
		expect(exhibit.statusLine).toBeNull();
	});
});

describe('buildVpToc', () => {
	test('lists h1 through h3 and skips deeper headings', () => {
		const toc = buildVpToc('# PART 1\n\n## Purpose\n\n### Detail\n\n#### Too deep\n');
		expect(toc.map((e) => e.depth)).toEqual([1, 2, 3]);
	});

	test('slugs every heading so ids match the rendered anchors', () => {
		const toc = buildVpToc('## Purpose\n\n## Purpose\n');
		expect(toc.map((e) => e.id)).toEqual(['purpose', 'purpose-1']);
	});

	test('ignores headings inside code fences', () => {
		const toc = buildVpToc('```\n# not a heading\n```\n\n## Real\n');
		expect(toc.map((e) => e.text)).toEqual(['Real']);
	});

	test('strips inline emphasis from entry text', () => {
		const toc = buildVpToc('## The **bold** part\n');
		expect(toc[0].text).toBe('The bold part');
	});
});
