import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	return {
		subtitle: `Token transfers for ${params.name}`,
		pageMetaTags: {
			title: `Token Transfers for ${params.name} | ${network.chain.name} Network`,
			description: `View the token transfer history of the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
