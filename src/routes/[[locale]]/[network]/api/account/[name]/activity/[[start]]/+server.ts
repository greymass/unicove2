import { json } from '@sveltejs/kit';

import { getActivity } from '../../activity';
import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';
import { getBackendClient } from '$lib/wharf/client/ssr';

export async function GET({ fetch, locals: { network }, params }: RequestEvent) {
	if (!network.supports('robo')) {
		return json(
			{ error: `Activity lookups via Robo not enabled on ${network.chain.name}.` },
			{ status: 500 }
		);
	}

	const start = Number(params.start) || 1;
	const client = getBackendClient(String(network), fetch, { history: true });
	const requests = [getActivity(client, params.name, start)];
	const headers = getCacheHeaders(5);

	try {
		const [activity] = await Promise.all(requests);
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
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
}
