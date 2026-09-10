import { json } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import { getProducersRecursive } from './utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network } }: RequestEvent) {
	const producers = await getProducersRecursive(network);
	const headers = getCacheHeaders(600);

	return json(
		{
			ts: new Date(),
			producers
		},
		{
			headers
		}
	);
}
