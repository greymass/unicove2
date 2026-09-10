import type { PageLoad } from './$types';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';

export const load: PageLoad = () => {
	return {
		subtitle: 'Rent with Rex',
		backPath: `/${PUBLIC_CHAIN_SHORT}/resources`
	};
};
