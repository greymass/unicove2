import { getCacheHeaders } from '$lib/utils/index.js';
import { isIndexableExplorerRoute, NOINDEX_HEADERS } from '$lib/seo/robots';
import type { LayoutServerLoad } from './$types';

// setHeaders throws if a descendant route also sets cache-control, so skip proposals here.
const OWN_CACHE_HEADERS_ROUTE = '/[[locale]]/[network]/(explorer)/proposals';

export const load: LayoutServerLoad = async ({ setHeaders, route }) => {
	const id = route.id;
	if (!isIndexableExplorerRoute(id)) setHeaders(NOINDEX_HEADERS);
	if (id === OWN_CACHE_HEADERS_ROUTE || id?.startsWith(`${OWN_CACHE_HEADERS_ROUTE}/`)) return;
	setHeaders(getCacheHeaders(0));
};
