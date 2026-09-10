import type { PageLoad } from './$types';
import type { LoadEvent } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }: LoadEvent) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: ['Tables', p.pageMetaTags.title].join(' | '),
			description: `The ${p.abi.tables.length} data tables in the ${p.contract} contract on the ${p.network.chain.name} network.`
		}
	};
};
