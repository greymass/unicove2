import { json } from '@sveltejs/kit';
import { ContractKit } from '@wharfkit/contract';

import type { RequestEvent, RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';

export const GET: RequestHandler = async ({ locals: { network }, params, url }: RequestEvent) => {
	const kit = new ContractKit({ client: network.client });
	try {
		const contract = await kit.load(params.contract);
		const data = Object.fromEntries(url.searchParams.entries());
		const results = await contract.readonly(params.name, data);
		const headers = getCacheHeaders(5);
		return json(
			{
				ts: new Date(),
				results
			},
			{ headers }
		);
	} catch (error) {
		return json({ message: String(error) }, { status: 500 });
	}
};
