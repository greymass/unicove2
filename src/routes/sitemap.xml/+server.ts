import type { RequestHandler } from '@sveltejs/kit';

import { LOCALES } from '$lib/constants/locales';
import {
	hubPaths,
	proposalEntries,
	renderSitemap,
	tokenPaths,
	topicEntries,
	type SitemapEntry
} from '$lib/seo/sitemap';
import type { NetworkState } from '$lib/state/network.svelte';
import type { ApiResponse, TopicsListData } from '$lib/types/sentiment';
import { fetchVpIndex } from '$lib/vp/fetch';
import { getCacheHeaders } from '$lib/utils';

function networkTokens(network: NetworkState): { contract: string; symbol: string }[] {
	const tokens = [network.getSystemToken(), network.getLegacyToken()];
	if (network.supports('rammarket')) tokens.push(network.getRamToken());
	if (network.supports('wram')) tokens.push(network.getWRAMToken());
	const ids = tokens
		.filter((t) => t !== undefined)
		.map((t) => ({ contract: String(t.id.contract), symbol: String(t.id.symbol.name) }));
	for (const token of network.config.tokens) {
		if (token.contract) ids.push({ contract: String(token.contract), symbol: token.symbol.name });
	}
	return ids;
}

async function topics(network: NetworkState, fetcher: typeof fetch): Promise<SitemapEntry[]> {
	if (!network.supports('sentiment') || !network.config.endpoints.sentiment) return [];
	const response = await fetcher(`${network.config.endpoints.sentiment}/v1/topics?limit=500`);
	if (!response.ok) return [];
	const result: ApiResponse<TopicsListData> = await response.json();
	return topicEntries((result.data?.topics ?? []).map((t) => t.topic));
}

async function proposals(network: NetworkState, fetcher: typeof fetch): Promise<SitemapEntry[]> {
	if (!network.supports('proposals')) return [];
	const index = await fetchVpIndex(fetcher);
	return proposalEntries(index.proposals);
}

// A failing dynamic section drops out rather than breaking the whole sitemap.
async function section(name: string, load: () => Promise<SitemapEntry[]>): Promise<SitemapEntry[]> {
	try {
		return await load();
	} catch (e) {
		console.error(`sitemap: ${name} section failed`, e);
		return [];
	}
}

export const GET: RequestHandler = async ({ fetch, locals: { network }, url }) => {
	const entries: SitemapEntry[] = [
		...hubPaths(network).map((path) => ({ path })),
		...tokenPaths(networkTokens(network)).map((path) => ({ path })),
		...(await section('proposals', () => proposals(network, fetch))),
		...(await section('topics', () => topics(network, fetch)))
	];
	return new Response(renderSitemap(url.origin, network.config.short, LOCALES, entries), {
		headers: { 'Content-Type': 'application/xml', ...getCacheHeaders(86400) }
	});
};
