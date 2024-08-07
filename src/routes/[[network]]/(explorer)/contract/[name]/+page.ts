import { error } from '@sveltejs/kit';
import type { API } from '@wharfkit/antelope';

import type { PageLoad } from './$types';
import { getClient } from '$lib/wharf/client';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ fetch, params }) => {
	let account: API.v1.AccountObject;
	let abi: API.v1.GetAbiResponse;
	try {
		account = await getClient(fetch).v1.chain.get_account(params.name);
		abi = await getClient(fetch).v1.chain.get_abi(params.name);
	} catch (e) {
		return error(500, {
			message: `Error while loading account ${params.name}: ${e}.`
		});
	}
	return {
		account,
		abi,
		name: params.name
	};
};
