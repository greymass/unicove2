import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Place Bid',
		subtitle: 'Bid on a premium name',
		backPath: `/${network}/bidname`,
		pageMetaTags: {
			title: `Place Bid - ${String(network.chain.name)} Premium Names`,
			description: `Place a bid on a premium account name on the ${String(network.chain.name)} network.`
		}
	};
};
