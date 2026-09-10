import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ALLOWED_PATH = /^[a-z1-5.]+(\/[a-z1-5.]+){0,2}$/;

export const GET: RequestHandler = async ({ fetch, locals: { network }, params, url }) => {
	const statindexUrl = network.config.endpoints.statindex;
	if (!network.supports('statindex') || !statindexUrl) {
		error(503, 'Network stats service not configured for this network');
	}

	if (!ALLOWED_PATH.test(params.path)) {
		error(400, 'Invalid stats path');
	}

	const apiUrl = new URL(`${statindexUrl}/stats/${params.path}`);
	url.searchParams.forEach((value, key) => {
		apiUrl.searchParams.set(key, value);
	});

	const response = await fetch(apiUrl.toString());
	if (!response.ok) {
		error(response.status, `Stats service error: ${response.statusText}`);
	}

	const headers: Record<string, string> = {
		'content-type': response.headers.get('content-type') ?? 'application/json'
	};
	const cacheControl = response.headers.get('cache-control');
	if (cacheControl) {
		headers['cache-control'] = cacheControl;
	}

	return new Response(await response.text(), { headers });
};
