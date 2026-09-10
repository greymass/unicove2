import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Create Account',
		subtitle: 'Create an account from a won premium name',
		backPath: `/${network}/bidname`,
		pageMetaTags: {
			title: `Create Account - ${String(network.chain.name)} Premium Names`,
			description: `Create an account from a won premium name on the ${String(network.chain.name)} network.`
		}
	};
};
