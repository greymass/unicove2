import { json, type RequestEvent } from '@sveltejs/kit';

import { UInt64 } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';
import { chainErrorStatus } from '$lib/utils/chainerror';
import { getBlocksClient } from '$lib/wharf/client/ssr';

export async function GET({ fetch, locals: { network }, params }: RequestEvent) {
	const blocks = getBlocksClient(String(network), fetch);
	try {
		const [info, block] = await Promise.all([
			network.client.v1.chain.get_info(),
			blocks.call({
				method: 'POST',
				path: '/v1/chain/get_block',
				params: {
					block_num_or_id: params.number
				}
			})
		]);

		const irreversible = info.last_irreversible_block_num.gte(UInt64.from(params.number));

		return json(
			{
				ts: new Date(),
				block
			},
			{
				headers: getCacheHeaders(5, irreversible)
			}
		);
	} catch (e) {
		const status = chainErrorStatus(e);
		return json(
			{ error: status === 404 ? 'Block not found.' : 'Unable to load block.' },
			{ status, headers: status === 404 ? getCacheHeaders(60) : {} }
		);
	}
}
