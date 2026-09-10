import { describe, expect, test } from 'bun:test';
import { hubPaths, proposalEntries, renderSitemap, tokenPaths, topicEntries } from './sitemap';

describe('hubPaths', () => {
	test('includes the homepage and governance hubs', () => {
		const paths = hubPaths({ supports: () => true });
		expect(paths).toContain('/');
		expect(paths).toContain('/proposals');
		expect(paths).toContain('/sentiment/topics');
		expect(paths).not.toContain('/sentiment');
		expect(paths).not.toContain('/send');
		expect(paths).not.toContain('/settings');
	});

	test('omits feature-gated hubs the network does not support', () => {
		const paths = hubPaths({ supports: (f) => f !== 'proposals' });
		expect(paths).not.toContain('/proposals');
		expect(paths).toContain('/producers');
	});
});

describe('tokenPaths', () => {
	test('lowercases symbols and dedupes', () => {
		const paths = tokenPaths([
			{ contract: 'core.vaulta', symbol: 'A' },
			{ contract: 'core.vaulta', symbol: 'A' },
			{ contract: 'eosio.token', symbol: 'EOS' }
		]);
		expect(paths).toEqual(['/token/core.vaulta/a', '/token/eosio.token/eos']);
	});
});

describe('proposalEntries', () => {
	test('uses the lowercase VP slug and prefers updated over created', () => {
		expect(
			proposalEntries([
				{ vp: 'VP-0001', created: '2026-01-01', updated: '2026-02-01' },
				{ vp: 'VP-0002', created: '2026-03-01', updated: null }
			])
		).toEqual([
			{ path: '/proposals/vp-0001', lastmod: '2026-02-01' },
			{ path: '/proposals/vp-0002', lastmod: '2026-03-01' }
		]);
	});
});

describe('topicEntries', () => {
	test('maps topic ids to sentiment topic pages', () => {
		expect(topicEntries([{ id: 'burnunused', lastUpdated: '2026-08-26T00:00:00Z' }])).toEqual([
			{ path: '/sentiment/topics/burnunused', lastmod: '2026-08-26T00:00:00Z' }
		]);
	});
});

describe('renderSitemap', () => {
	test('expands each entry per locale against the given origin', () => {
		const xml = renderSitemap(
			'https://unicove.com',
			'vaulta',
			['en', 'ko'],
			[{ path: '/' }, { path: '/proposals/vp-0001', lastmod: '2026-02-01' }]
		);
		expect(xml).toContain('<loc>https://unicove.com/en/vaulta</loc>');
		expect(xml).toContain('<loc>https://unicove.com/ko/vaulta</loc>');
		expect(xml).toContain('<loc>https://unicove.com/en/vaulta/proposals/vp-0001</loc>');
		expect(xml).toContain('<lastmod>2026-02-01</lastmod>');
		expect(xml).not.toContain('sveltekit');
		expect(xml).not.toContain('changefreq');
	});

	test('escapes XML special characters in paths', () => {
		const xml = renderSitemap('https://unicove.com', 'vaulta', ['en'], [{ path: '/a&b' }]);
		expect(xml).toContain('/a&amp;b');
	});
});
