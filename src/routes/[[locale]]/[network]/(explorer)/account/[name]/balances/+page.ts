import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: `Token balances on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Token Balances | ${params.name} | ${network.chain.name} Network`,
			description: `The token balances of the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
