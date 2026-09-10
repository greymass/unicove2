import type { PageLoad } from './$types';
import { ramtoken, systemtoken } from '$lib/wharf/chains';

export const load: PageLoad = async ({ parent, params }) => {
	const { network } = await parent();
	const locale = params.locale || 'en';
	return {
		backPath: `/${locale}/${network}/ram`,
		title: 'Sell RAM',
		subtitle: `Exchange RAM for ${String(network.chain.systemToken?.symbol.name || 'tokens')} on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: [
				'Sell RAM',
				`${ramtoken.name}/${systemtoken.name} Market | ${network.chain.name} Network`
			].join(' | '),
			description: `Exchange RAM for ${String(network.chain.systemToken?.symbol.name || 'tokens')} on the ${network.chain.name} network using an ${network.chain.name} compatible wallet.`
		}
	};
};
