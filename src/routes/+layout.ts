import { type SeoConfig } from 'svead';

import { i18n } from '$lib/i18n';
import { getNetworkFromParams } from '$lib/state/network.svelte.js';

function generateMetadata(url: URL): SeoConfig {
	const modified = new URL(url);
	modified.pathname = i18n.route(url.pathname);
	return {
		url: String(modified),
		title: '2nicove',
		description: 'Unicove, but 2.0'
	};
}

export const load = async ({ fetch, params, url }) => {
	const baseMetaTags = generateMetadata(url);
	const network = getNetworkFromParams(params.network, fetch);
	if (!network.loaded) {
		await network.refresh();
	}
	return {
		baseMetaTags,
		network
	};
};
