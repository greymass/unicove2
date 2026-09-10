import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Swaps',
		subtitle: `Available token swaps on the ${network.chain.name} network`,
		pageMetaTags: {
			title: 'Swaps',
			description: `Available token swaps on the ${network.chain.name} network`
		}
	};
};
