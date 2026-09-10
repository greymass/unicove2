import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';

export const GET: RequestHandler = async ({ fetch, locals: { network }, url }) => {
	try {
		const base = network.config.endpoints.msg;
		if (!base) {
			throw error(503, 'Discussion API not configured for this network');
		}
		const apiUrl = new URL(`${base}/v1/msg/get_tag_summary`);
		const channel = url.searchParams.get('channel');
		if (channel) apiUrl.searchParams.set('channel', channel);
		for (const tuple of url.searchParams.getAll('tags')) {
			apiUrl.searchParams.append('tags', tuple);
		}
		const response = await fetch(apiUrl.toString());
		if (!response.ok) {
			throw error(response.status, `Discussion API error: ${response.statusText}`);
		}
		const data = await response.json();
		return json(data, { headers: getCacheHeaders(5) });
	} catch (e) {
		console.error('Discussion summary API error:', e);
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		throw error(500, 'Failed to fetch discussion summary');
	}
};
