import { error } from '@sveltejs/kit';
import type { API } from '@wharfkit/antelope';

import type { PageLoad } from './$types';
import { getClient } from '$lib/wharf/client';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ fetch, params }) => {
	// Attempt to load the block from the API
	let block: API.v1.GetBlockResponse;
	try {
		block = await getClient(fetch).v1.chain.get_block(params.number);
	} catch (e) {
		return error(500, {
			message: `Error while loading block ${params.number}: ${e}.`
		});
	}
	// Create metadata for the page
	const description = m.block_height_numbered_description({
		height: params.number,
		producer: block.producer,
		timestamp: block.timestamp.toDate(),
		transactions: block.transactions.length,
		actions: block.transactions.reduce((acc, tx) => acc + tx.trx.transaction.actions.length, 0)
	});
	return {
		block,
		height: params.number,
		pageMetaTags: {
			title: m.block_height_numbered({ height: params.number }),
			description
		}
	};
};
