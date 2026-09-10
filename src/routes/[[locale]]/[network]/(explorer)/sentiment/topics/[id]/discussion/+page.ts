import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ parent }) => {
	const data = await parent();
	if (!data.network.supports('discussion')) {
		error(404, 'Not found');
	}
	return { ...data, subtitle: 'Discussion' };
};
