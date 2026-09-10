import type { PageLoad } from './$types';
import type { LoadEvent } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }: LoadEvent) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: 'ABI',
			description: `The ABI defining the ${p.contract} smart contract on the ${p.network.chain.name} network.`
		}
	};
};
