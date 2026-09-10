import type { PageLoad } from './$types';
import type { LoadEvent } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }: LoadEvent) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: ['Actions', p.pageMetaTags.title].join(' | '),
			description: `The ${p.abi.actions.length} smart contract actions available for the ${p.contract} contract on the ${p.network.chain.name} network.`
		}
	};
};
