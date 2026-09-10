import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	const title = 'Tools';
	return {
		title,
		subtitle: `Everything else you can do with your account on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `${network.chain.name} Network Tools`,
			description: `A collection of tools for managing accounts, tokens, and resources on the ${network.chain.name} Network.`
		}
	};
};
