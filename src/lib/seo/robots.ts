const EXPLORER_PREFIX = '/[[locale]]/[network]/(explorer)/';

// Route families whose URL space is unbounded and hash-named; never worth indexing.
const NOINDEX_FAMILIES = ['transaction', 'block', 'key', 'msig', 'prompt'];

// Entity families where only the overview page (no sub-path) is indexable.
const OVERVIEW_ONLY_FAMILIES: Record<string, number> = {
	account: 1,
	contract: 1,
	token: 2
};

export function isIndexableExplorerRoute(routeId: string | null | undefined): boolean {
	if (!routeId || !routeId.startsWith(EXPLORER_PREFIX)) return true;
	const segments = routeId.slice(EXPLORER_PREFIX.length).split('/');
	const family = segments[0];
	if (NOINDEX_FAMILIES.includes(family)) return false;
	const paramDepth = OVERVIEW_ONLY_FAMILIES[family];
	if (paramDepth !== undefined) return segments.length <= 1 + paramDepth;
	return true;
}

export const NOINDEX_HEADERS = { 'x-robots-tag': 'noindex' };
