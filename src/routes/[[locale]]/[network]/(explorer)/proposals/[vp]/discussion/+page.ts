import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	if (!network.supports('discussion')) {
		error(404, 'Not found');
	}
	return {};
};
