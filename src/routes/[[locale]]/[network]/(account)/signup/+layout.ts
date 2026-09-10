import { error } from '@sveltejs/kit';

import { supportsAccountCreation } from '$lib/wharf/plugins';
import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	if (!supportsAccountCreation(network.chain.id)) {
		error(404, 'Not found');
	}
	await useLocale(locale);
	return {
		title: `Get started on the ${network.chain.name} Network`,
		subtitle: `Create an account on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: `Get started on the ${network.chain.name} Network`,
			description: `Create an account on the ${network.chain.name} network and explore it with Unicove.`
		}
	};
};
