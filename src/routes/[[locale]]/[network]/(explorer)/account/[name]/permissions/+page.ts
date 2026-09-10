import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		subtitle: `Permissions on the ${network.chain.name} Network`,
		pageMetaTags: {
			title: `Permissions | ${params.name} | ${network.chain.name} Network`,
			description: `Permissions for ${params.name} on the ${network.chain.name} network.`
		}
	};
};
