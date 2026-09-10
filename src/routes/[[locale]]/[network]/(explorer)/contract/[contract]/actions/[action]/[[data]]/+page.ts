import { error, type LoadEvent } from '@sveltejs/kit';
import type { ABI } from '@wharfkit/antelope';

import { parseRicardian } from '$lib/utils/ricardian';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }: LoadEvent) => {
	const p = await parent();
	const action = p.abi.actions.find((s: ABI.Action) => s.name === params.action);
	if (!action) {
		error(404);
	}
	const struct = p.abi.structs.find((s: ABI.Struct) => s.name === action.type);
	const ricardian = parseRicardian(action);

	const urlOrigin = new URL(url).origin;
	return {
		action,
		struct,
		urlOrigin,
		data: params.data,
		pageMetaTags: {
			title: [`Action: ${params.action}`, p.pageMetaTags.title].join(' | '),
			description: `The ${params.action} action for the ${p.contract} smart contract on the ${p.network.chain.name} network.`
		},
		ricardian
	};
};
