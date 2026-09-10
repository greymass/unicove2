import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	const title = 'Tokens';
	return {
		...data,
		title,
		subtitle: `Tokens on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `${network.chain.name} Network Tokens`,
			description: `A directory of tokens on the ${network.chain.name} Network.`
		}
	};
};
