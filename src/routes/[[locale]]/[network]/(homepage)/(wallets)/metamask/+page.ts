import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();

	if (!network.config.metamask) {
		throw error(404, 'Network does not support MetaMask Snaps');
	}

	return {
		title: `MetaMask + ${network.config.metamask.name}`,
		subtitle: `Get started with MetaMask on the ${network.chain.name} Network with the ${network.config.metamask.name} snap.`,
		pageMetaTags: {
			title: `MetaMask + ${network.config.metamask.name}`,
			description: `Get started with MetaMask on the ${network.chain.name} Network with the ${network.config.metamask.name} snap.`
		}
	};
};
