import { json, type RequestEvent } from '@sveltejs/kit';

import { PUBLIC_ENVIRONMENT } from '$env/static/public';

import { getCacheHeaders } from '$lib/utils';

export async function GET({ locals: { network } }: RequestEvent) {
	if (PUBLIC_ENVIRONMENT === 'production') {
		return json({ error: 'Unable to load configuration in production.' }, { status: 500 });
	}
	return json(network.config, {
		headers: getCacheHeaders(300)
	});
}
