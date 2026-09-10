import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Rent Resources',
		subtitle: `Rent CPU and NET resources on the ${network.chain.name} Network.`,
		backPath: `/${network}/resources`,
		pageMetaTags: {
			title: `Rent Resources | ${network.chain.name} Network`,
			description: `Rent CPU and NET resources on the ${network.chain.name} Network using an ${network.chain.name} compatible wallet.`
		}
	};
};
