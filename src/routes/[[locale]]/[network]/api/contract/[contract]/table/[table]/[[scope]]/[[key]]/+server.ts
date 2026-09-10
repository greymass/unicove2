import { json } from '@sveltejs/kit';
import { ContractKit } from '@wharfkit/contract';

import type { RequestEvent, RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';

export const GET: RequestHandler = async ({ locals: { network }, params, url }: RequestEvent) => {
	const kit = new ContractKit({ client: network.client });
	const contract = await kit.load(params.contract);

	const from = url.searchParams.get('from') || url.searchParams.get('lower') || undefined;
	const to = url.searchParams.get('to') || url.searchParams.get('upper') || undefined;
	const limit = Number(url.searchParams.get('limit') || 10);
	const orderParam = url.searchParams.get('order');
	const reverseParam = url.searchParams.get('reverse');
	const reverse = orderParam ? orderParam === 'desc' : reverseParam === 'true';
	const indexPosition = url.searchParams.get('index') || undefined;
	const keyType = url.searchParams.get('key_type') || undefined;

	const table = await contract.table(params.table, params.scope);

	try {
		const cursor = table.query({
			from,
			to,
			reverse,
			index_position: indexPosition,
			key_type: keyType as
				| 'i64'
				| 'i128'
				| 'float64'
				| 'float128'
				| 'name'
				| 'sha256'
				| 'ripemd160'
				| undefined
		});

		let rows = [];
		if (params.key) {
			rows = [await table.get(params.key)];
		} else {
			rows = await cursor.next(limit);
		}

		const headers = getCacheHeaders(5);

		return json(
			{
				ts: new Date(),
				rows,
				next: cursor.nextkey
			},
			{ headers }
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unable to load table data.';
		const isIndexError =
			message.includes('index') || message.includes('assertion') || message.includes('key_type');
		return json(
			{
				error: isIndexError ? 'This index position is not available for this table.' : message,
				rows: [],
				next: null
			},
			{ status: isIndexError ? 400 : 500 }
		);
	}
};
