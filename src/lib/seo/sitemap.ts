import type { FeatureType } from '$lib/wharf/chains';

export interface SitemapEntry {
	path: string;
	lastmod?: string;
}

interface FeatureGate {
	supports(feature: FeatureType): boolean;
}

// Indexable hub pages; wallet forms and settings are excluded on purpose.
const HUBS: { path: string; feature?: FeatureType }[] = [
	{ path: '/' },
	{ path: '/metamask', feature: 'metamask' },
	{ path: '/staking', feature: 'staking' },
	{ path: '/ram', feature: 'rammarket' },
	{ path: '/swap' },
	{ path: '/resources' },
	{ path: '/create-account' },
	{ path: '/signup' },
	{ path: '/producers' },
	{ path: '/network' },
	{ path: '/governance' },
	{ path: '/sentiment/topics', feature: 'sentiment' },
	{ path: '/proposals', feature: 'proposals' },
	{ path: '/token' },
	{ path: '/contract' },
	{ path: '/account' }
];

export function hubPaths(network: FeatureGate): string[] {
	return HUBS.filter((h) => !h.feature || network.supports(h.feature)).map((h) => h.path);
}

export function tokenPaths(tokens: { contract: string; symbol: string }[]): string[] {
	const seen = new Set<string>();
	const paths: string[] = [];
	for (const { contract, symbol } of tokens) {
		const path = `/token/${contract}/${symbol.toLowerCase()}`;
		if (seen.has(path)) continue;
		seen.add(path);
		paths.push(path);
	}
	return paths;
}

export function proposalEntries(
	proposals: { vp: string; created: string; updated: string | null }[]
): SitemapEntry[] {
	return proposals.map((p) => ({
		path: `/proposals/${p.vp.toLowerCase()}`,
		lastmod: p.updated ?? p.created
	}));
}

export function topicEntries(topics: { id: string; lastUpdated?: string }[]): SitemapEntry[] {
	return topics.map((t) => ({ path: `/sentiment/topics/${t.id}`, lastmod: t.lastUpdated }));
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function renderSitemap(
	origin: string,
	network: string,
	locales: string[],
	entries: SitemapEntry[]
): string {
	const urls: string[] = [];
	for (const locale of locales) {
		for (const entry of entries) {
			const suffix = entry.path === '/' ? '' : entry.path;
			const loc = escapeXml(`${origin}/${locale}/${network}${suffix}`);
			const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
			urls.push(`  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`);
		}
	}
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
