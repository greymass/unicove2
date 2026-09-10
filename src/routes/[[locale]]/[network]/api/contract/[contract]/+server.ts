import { json } from '@sveltejs/kit';
import { type API } from '@wharfkit/antelope';

import type { RequestEvent, RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';

export const GET: RequestHandler = async ({ locals: { network }, params }: RequestEvent) => {
	const requests: [Promise<API.v1.GetAbiResponse>] = [
		network.client.v1.chain.get_abi(params.contract)
	];

	try {
		const headers = getCacheHeaders(5);
		const [abi] = await Promise.all(requests);

		return json(
			{
				ts: new Date(),
				abi
			},
			{ headers }
		);
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
};
