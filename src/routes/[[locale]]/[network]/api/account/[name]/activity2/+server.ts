import { json } from '@sveltejs/kit';

import { getActivity2 } from '../activity2';
import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';
import { getRobo2Client } from '$lib/wharf/client/ssr';

export async function GET({ fetch, locals: { network }, params, url }: RequestEvent) {
	if (!network.supports('robo2')) {
		return json(
			{ error: `Activity v2 lookups via Robo2 not enabled on ${network.chain.name}.` },
			{ status: 500 }
		);
	}

	const robo = getRobo2Client(String(network), fetch);
	if (!robo) {
		return json(
			{ error: `Robo2 client not configured for ${network.chain.name}.` },
			{ status: 500 }
		);
	}

	const cursor = url.searchParams.get('cursor') || undefined;
	const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
	const order = (url.searchParams.get('order') as 'asc' | 'desc') || undefined;
	const contract = url.searchParams.get('contract') || undefined;
	const action = url.searchParams.get('action') || undefined;
	const date = url.searchParams.get('date') || undefined;
	const start_date = url.searchParams.get('start_date') || undefined;
	const end_date = url.searchParams.get('end_date') || undefined;

	const headers = getCacheHeaders(5);

	try {
		const activity = await getActivity2(robo, params.name, {
			cursor,
			limit,
			order,
			contract,
			action,
			date,
			start_date,
			end_date
		});
		return json(
			{
				ts: new Date(),
				activity
			},
			{
				headers
			}
		);
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load account activity.' }, { status: 500 });
	}
}
