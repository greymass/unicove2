import { error } from '@sveltejs/kit';
import type { API } from '@wharfkit/antelope';

import type { PageLoad } from './$types';
import { getClient } from '$lib/wharf/client';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ fetch, params }) => {
	let transaction: API.v1.GetTransactionResponse;
	try {
		transaction = await getClient(fetch).v1.history.get_transaction(params.id);
	} catch (e) {
		return error(500, {
			message: `Error while loading account ${params.id}: ${e}.`
		});
	}
	return {
		id: params.id,
		transaction
	};
};
