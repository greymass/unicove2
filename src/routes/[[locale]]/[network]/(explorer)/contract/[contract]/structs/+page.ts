import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	return {
		pageMetaTags: {
			title: ['Structs', p.pageMetaTags.title].join(' | '),
			description: `The ${p.abi.structs.length} data structures defined by the ${p.contract} smart contract on the ${p.network.chain.name} network.`
		}
	};
};
