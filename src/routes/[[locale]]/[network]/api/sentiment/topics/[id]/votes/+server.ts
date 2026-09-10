import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';

export const GET: RequestHandler = async ({ fetch, locals: { network }, params, url }) => {
	try {
		const sentimentApiUrl = network.config.endpoints.sentiment;

		if (!sentimentApiUrl) {
			throw error(503, 'Sentiment API not configured for this network');
		}

		const topicId = params.id;

		const apiUrl = new URL(`${sentimentApiUrl}/v1/topics/${topicId}/votes`);
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
		console.error('Sentiment votes API error:', e);
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		throw error(500, 'Failed to fetch sentiment votes');
	}
};
