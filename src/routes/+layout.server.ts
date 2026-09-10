import { type SeoConfig } from 'svead';
import { ogImageURL } from '$lib/utils/opengraph';
import type { LayoutServerLoad } from './$types';
import type { NetworkState } from '$lib/state/network.svelte';
import { error } from '@sveltejs/kit';
import { API_OPENGRAPH_GENERATOR, API_OPENGRAPH_TOKEN } from '$env/static/private';
import { localizeUrl } from '$lib/utils/url';

function generateMetadata(url: URL, network: NetworkState): SeoConfig {
	let open_graph_image = undefined;
	if (API_OPENGRAPH_GENERATOR && API_OPENGRAPH_TOKEN) {
		open_graph_image = ogImageURL(url, {
			title: 'Unicove',
			text: 'Your gateway to Web3'
		});
	}

	return {
		url: localizeUrl(String(url)),
		title: `Unicove - The ${network.chain.name} web wallet and block explorer`,
		description: `Stake, Send, Manage Tokens, and Explore ${network.chain.name} – all with ease`,
		open_graph_image
	};
}

export const load: LayoutServerLoad = async ({ locals: { network }, url }) => {
	if (!network) {
		error(404, {
			message: 'Page not found'
		});
	}
	const baseMetaTags = generateMetadata(url, network);
	return {
		baseMetaTags
	};
};
