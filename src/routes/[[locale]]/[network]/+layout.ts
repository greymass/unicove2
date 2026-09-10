import { browser } from '$app/environment';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { getNetworkByName } from '$lib/state/network.svelte.js';
import type { LayoutLoad } from './$types';
import '../../../locales/loader.svelte.js';
import { useLocale } from '$lib/utils/intl';

export const load: LayoutLoad = async ({ fetch, params }) => {
	const network = getNetworkByName(PUBLIC_CHAIN_SHORT, fetch);
	if (browser && !network.loaded) {
		await network.refresh();
	}
	await useLocale(params.locale);
	return {
		locale: params.locale,
		network
	};
};
