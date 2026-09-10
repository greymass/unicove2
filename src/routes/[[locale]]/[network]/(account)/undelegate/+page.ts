import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Reclaim',
		subtitle: `Undelegate and reclaim previously delegated ${network.token.name} tokens`,
		pageMetaTags: {
			title: `Reclaim Delegated ${network.token.name} Tokens`,
			description: `Undelegate and reclaim previously delegated ${network.token.name} tokens`
		}
	};
};
