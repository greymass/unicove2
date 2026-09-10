import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	const title = `${network.chain.name} Network Resources`;
	return {
		title,
		subtitle: `Manage CPU, NET, and RAM resources on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title,
			description: `An overview of the multiple network resources usable on the ${network.chain.name} Network providing access to manage resources using an compatible wallet.`
		}
	};
};
