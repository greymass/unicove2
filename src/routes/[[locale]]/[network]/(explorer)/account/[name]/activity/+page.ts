import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	return {
		subtitle: `Recent activity on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Account Activity for ${params.name} | ${network.chain.name} Network`,
			description: `View the transaction history of the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
