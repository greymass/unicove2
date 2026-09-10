import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		payload: params.payload,
		title: 'Signing Request',
		subtitle: 'Review the actions below and sign the transaction.',
		pageMetaTags: {}
	};
};
