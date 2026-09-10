import type { PageLoad } from './$types';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';

export const load: PageLoad = () => {
	return {
		subtitle: 'Renting',
		backPath: `/${PUBLIC_CHAIN_SHORT}/resources`
	};
};
