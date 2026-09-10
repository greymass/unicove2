import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { getBackendNetworkByName } from '$lib/wharf/client/ssr';

import * as main from './locales/loader.ssr.svelte';
import * as js from './locales/loader.ssr';
import { runWithLocale, loadLocales } from 'wuchale/load-utils/server';
import { locales } from 'virtual:wuchale/locales';
import { resolveLocale, resolveRedirect } from '$lib/utils/url';
import { getCacheHeaders } from '$lib/utils';

await loadLocales(main.key, main.loadIDs, main.loadCatalog, locales);
await loadLocales(js.key, js.loadIDs, js.loadCatalog, locales);

export const wuchaleHandle: Handle = async ({ event, resolve }) => {
	const locale = resolveLocale(event.url.pathname, event.cookies.get('locale'));
	event.locals.locale = locale;
	return await runWithLocale(locale, () =>
		resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	);
};

type HandleParams = Parameters<Handle>[0];

export async function networkHandle({ event, resolve }: HandleParams): Promise<Response> {
	event.locals.network = getBackendNetworkByName(PUBLIC_CHAIN_SHORT, event.fetch);
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%network%', event.locals.network.toString())
	});
	if (event.url.pathname.includes('/api/')) response.headers.set('x-robots-tag', 'noindex');
	if (response.status === 404) {
		for (const [k, v] of Object.entries(getCacheHeaders(60))) response.headers.set(k, v);
	}
	return response;
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);
	const redirect = resolveRedirect(pathname, event.cookies.get('locale'));
	if (!redirect) return resolve(event);
	const headers: Record<string, string> = { Location: redirect.location + search };
	if (redirect.cacheable) Object.assign(headers, getCacheHeaders(3600));
	return new Response(undefined, { headers, status: redirect.status });
}

export const handle: Handle = sequence(wuchaleHandle, redirectHandle, networkHandle);
