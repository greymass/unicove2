import type { PageLoad } from './$types';
import { ramtoken, systemtoken } from '$lib/wharf/chains';

export const load: PageLoad = async ({ parent, params }) => {
	const { network } = await parent();
	const locale = params.locale || 'en';
	return {
		backPath: `/${locale}/${network}/ram`,
		title: 'Buy RAM',
		subtitle: `Exchange ${String(network.chain.systemToken?.symbol.name || 'tokens')} for RAM on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: [
				'Buy RAM',
				`${ramtoken.name}/${systemtoken.name} Market | ${network.chain.name} Network`
			].join(' | '),
			description: `Exchange ${systemtoken.name} for ${ramtoken.name} on the ${network.chain.name} network.`
		}
	};
};
