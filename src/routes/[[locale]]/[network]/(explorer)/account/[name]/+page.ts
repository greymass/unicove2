import { ogImageURL } from '$lib/utils/opengraph';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
	const { network } = await parent();
	const metaTitle = `${String(params.name)} | ${network.chain.name} Network Account`;
	const metaDescription = `An overview of the ${String(params.name)} account on the ${network.chain.name} Network. View account assets, activity, resources and more.`;

	return {
		subtitle: `Account overview on the ${network.chain.name} Network`,
		pageMetaTags: {
			title: metaTitle,
			description: metaDescription,
			open_graph_image: ogImageURL(url, {
				title: params.name,
				text: metaTitle
			})
		}
	};
};
