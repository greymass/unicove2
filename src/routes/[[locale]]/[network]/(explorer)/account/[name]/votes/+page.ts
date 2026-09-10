import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: `Votes cast by ${params.name} on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Votes by ${params.name} | ${network.chain.name} Network`,
			description: `View the block producer votes cast by the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
