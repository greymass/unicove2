import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: `Raw data for ${params.name} on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Account Data for ${params.name} | ${network.chain.name} Network`,
			description: `View the stored data and tables for the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
