import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Claim Refund',
		subtitle: 'Reclaim tokens from an outbid name auction',
		backPath: `/${network}/bidname`,
		pageMetaTags: {
			title: `Claim Refund - ${String(network.chain.name)} Premium Names`,
			description: `Claim a refund for outbid premium name auctions on the ${String(network.chain.name)} network.`
		}
	};
};
