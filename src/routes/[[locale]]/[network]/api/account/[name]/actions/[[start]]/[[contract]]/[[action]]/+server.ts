import { json } from '@sveltejs/kit';

import { getFilteredActivity } from '../../../../activity';
import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';
import { getBackendClient } from '$lib/wharf/client/ssr';

export async function GET({ fetch, locals: { network }, params }: RequestEvent) {
	if (!network.supports('hyperion')) {
		return json(
			{ error: `Action lookups via Hyperion not enabled on ${network.chain.name}.` },
			{ status: 500 }
		);
	}

	const start = Number(params.start) || 1;
	const client = getBackendClient(String(network), fetch, { hyperion: true });
	const requests = [
		getFilteredActivity(client, params.name, start, {
			account: params.contract,
			action: params.action
		})
	];
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
