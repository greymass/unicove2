import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';

const ALLOWED = ['channel', 'tags', 'limit', 'before', 'after', 'include_deleted', 'omit_content'];

export const GET: RequestHandler = async ({ fetch, locals: { network }, url }) => {
	try {
		const base = network.config.endpoints.msg;
		if (!base) {
			throw error(503, 'Discussion API not configured for this network');
		}
		const apiUrl = new URL(`${base}/v1/msg/get_messages`);
		for (const key of ALLOWED) {
			const value = url.searchParams.get(key);
			if (value !== null) apiUrl.searchParams.set(key, value);
		}
		const response = await fetch(apiUrl.toString());
		if (!response.ok) {
			throw error(response.status, `Discussion API error: ${response.statusText}`);
		}
		const data = await response.json();
		return json(data, { headers: getCacheHeaders(5) });
	} catch (e) {
		console.error('Discussion messages API error:', e);
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		throw error(500, 'Failed to fetch discussion messages');
	}
};
