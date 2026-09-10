import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: `Raw data from the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Raw Data | ${params.name} | ${network.chain.name} Network`,
			description: `The raw data for the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
