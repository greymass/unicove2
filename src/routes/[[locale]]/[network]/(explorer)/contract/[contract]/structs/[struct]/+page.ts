import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, parent }) => {
	const p = await parent();
	if (!p.abi.structs.find((s) => s.name === params.struct)) {
		error(404);
	}
	return {
		pageMetaTags: {
			title: [`Struct: ${params.struct}`, p.pageMetaTags.title].join(' | '),
			description: `The ${params.struct} data structure as defined by the ${p.contract} smart contract on the ${p.network.chain.name} network.`
		},
		struct: params.struct
	};
};
