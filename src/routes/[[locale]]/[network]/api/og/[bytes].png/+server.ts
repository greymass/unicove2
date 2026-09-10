import { PUBLIC_ENVIRONMENT } from '$env/static/public';
import type { RequestHandler } from './$types';
import { API_OPENGRAPH_GENERATOR, API_OPENGRAPH_TOKEN } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { Serializer } from '@wharfkit/antelope';
import { OpengraphImageData } from '$lib/types/opengraph';

export const GET: RequestHandler = async ({ locals, fetch, params }) => {
	if (!API_OPENGRAPH_GENERATOR || !API_OPENGRAPH_TOKEN) {
		error(401, 'Unauthorized');
	}

	let data: OpengraphImageData;
	try {
		data = Serializer.decode({ data: params.bytes, type: OpengraphImageData });
	} catch (e) {
		error(400, JSON.stringify(e));
	}
	const { title, text } = data;
	const lang = 'en'; // TODO
	const network = locals.network.toString();

	const body = {
		lang,
		network,
		title,
		text
	};

	const response = await fetch(API_OPENGRAPH_GENERATOR, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${API_OPENGRAPH_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	const cacheAge = PUBLIC_ENVIRONMENT === 'production' ? 86400 : 300;

	return new Response(await response.arrayBuffer(), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': `public, max-age=${cacheAge}, stale-while-revalidate=${cacheAge}`
		}
	});
};
