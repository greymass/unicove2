import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';

export const GET: RequestHandler = async ({ fetch, locals: { network }, params, url }) => {
	try {
		const sentimentApiUrl = network.config.endpoints.sentiment;

		if (!sentimentApiUrl) {
			throw error(503, 'Sentiment API not configured for this network');
		}

		const { proposer, proposal } = params;
		const apiUrl = new URL(`${sentimentApiUrl}/v1/msigs/${proposer}/${proposal}/votes`);
		url.searchParams.forEach((value, key) => {
			apiUrl.searchParams.set(key, value);
		});

		const response = await fetch(apiUrl.toString());

		if (!response.ok) {
			throw error(response.status, `Sentiment API error: ${response.statusText}`);
		}

		const data = await response.json();

		return json(data, {
			headers: getCacheHeaders(5)
		});
	} catch (e) {
		console.error('Sentiment msig votes API error:', e);
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		throw error(500, 'Failed to fetch sentiment msig votes');
	}
};
