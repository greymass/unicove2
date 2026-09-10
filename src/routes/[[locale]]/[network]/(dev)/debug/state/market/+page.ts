import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: `Market State`,
		subtitle: ``,
		pageMetaTags: {
			title: `Market State`,
			description: ``
		}
	};
};
