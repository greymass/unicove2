import { error } from '@sveltejs/kit';
import { getCacheHeaders } from '$lib/utils';
import { fetchVpIndex, VpFetchError } from '$lib/vp/fetch';
import type { PageServerLoad } from './$types';

function indexErrorMessage(e: unknown): string {
	const code = e instanceof VpFetchError ? e.code : null;
	if (code === 'unreachable') {
		return 'The proposals repository could not be reached.';
	}
	return 'The proposal index could not be read.';
}

export const load: PageServerLoad = async ({ fetch, locals, setHeaders }) => {
	if (!locals.network.supports('proposals')) {
		error(404, 'Not found');
	}

	setHeaders(getCacheHeaders(300));

	const title = 'Proposals';
	const description = 'Network proposals for Vaulta, published for public review.';

	const meta = {
		title,
		subtitle: description,
		pageMetaTags: {
			title: [title, locals.network.chain.name].join(' | '),
			description
		}
	};

	try {
		const index = await fetchVpIndex(fetch);
		return { ...meta, proposals: index.proposals, error: null };
	} catch (e) {
		return { ...meta, proposals: [], error: indexErrorMessage(e) };
	}
};
