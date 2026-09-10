import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	return {
		title: `Premium Name Bidding`,
		subtitle: `Bid on premium names on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: `Premium Name Bidding`,
			description: `Browse and bid on premium account names on the ${network.chain.name} network.`
		}
	};
};
