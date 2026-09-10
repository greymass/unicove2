import { error } from '@sveltejs/kit';

import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	if (!network.supports('statindex')) {
		error(404, 'Not found');
	}
	await useLocale(locale);
	const title = 'Accounts';
	return {
		title,
		subtitle: `The most active accounts on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `${network.chain.name} Network Accounts`,
			description: `A leaderboard of the most active accounts on the ${network.chain.name} Network.`
		}
	};
};
