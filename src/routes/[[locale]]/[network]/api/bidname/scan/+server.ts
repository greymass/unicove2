import { json } from '@sveltejs/kit';
import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network }, url }: RequestEvent) {
	const account = url.searchParams.get('account');
	const cursor = url.searchParams.get('cursor') || undefined;
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);

	if (!account) {
		return json({ error: 'account parameter required' }, { status: 400 });
	}

	try {
		const eosio = network.contracts.eosio;
		const query = eosio.table('namebids').query({
			from: cursor,
			maxRows: limit,
			rowsPerAPIRequest: limit
		});

		const rows = await query.next(limit);
		const nextCursor = query.nextkey ? String(query.nextkey) : null;

		const found: string[] = [];
		for (const row of rows) {
			if (String(row.high_bidder) === account) {
				found.push(String(row.newname));
			}
		}

		return json({ found, nextCursor, scanned: rows.length }, { headers: getCacheHeaders(0) });
	} catch (e) {
		console.error('GET bidname/scan error', e);
		return json({ error: String(e) }, { status: 500 });
	}
}
