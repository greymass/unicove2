import { json } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';

import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network }, params }: RequestEvent) {
	const scope = Name.from(params.proposer);

	const proposals = await network.contracts.msig.table('proposal', scope).all();

	return json(
		{
			ts: new Date(),
			proposer: params.proposer,
			proposals
		},
		{
			headers: getCacheHeaders(5)
		}
	);
}
