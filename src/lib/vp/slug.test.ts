import { describe, expect, test } from 'bun:test';
import { createSlugger, slugify } from './slug';

describe('slugify', () => {
	test('lowercases an ASCII heading and hyphenates spaces', () => {
		expect(slugify('Bounds on the Endowment')).toBe('bounds-on-the-endowment');
	});

	test('preserves non-Latin letters instead of stripping them', () => {
		expect(slugify('제안 배경')).toBe('제안-배경');
	});

	test('strips punctuation while keeping letters and digits', () => {
		expect(slugify("What's the deal, VP-0001?")).toBe('whats-the-deal-vp-0001');
	});

	test('keeps underscores so anchors match the rendering on GitHub', () => {
		expect(slugify('snake_case config')).toBe('snake_case-config');
	});

	test('collapses runs of whitespace to a single hyphen', () => {
		expect(slugify('Too   many    spaces')).toBe('too-many-spaces');
	});
});

describe('createSlugger', () => {
	test('gives distinct ids to two headings with identical text', () => {
		const slug = createSlugger();
		expect(slug('Overview')).toBe('overview');
		expect(slug('Overview')).toBe('overview-1');
		expect(slug('Overview')).toBe('overview-2');
	});

	test('does not disambiguate unrelated headings', () => {
		const slug = createSlugger();
		expect(slug('Background')).toBe('background');
		expect(slug('Rationale')).toBe('rationale');
	});

	test('falls back to a stable id for a heading that slugifies to empty', () => {
		const slug = createSlugger();
		expect(slug('!!!')).toBe('section');
		expect(slug('???')).toBe('section-1');
	});
});
