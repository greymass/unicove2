import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Refund',
		subtitle: `Claim previously delegated ${String(network.chain.systemToken?.symbol.name)} tokens`,
		pageMetaTags: {
			title: `Refund Delegated ${String(network.chain.name)} Tokens`,
			description: `Claim previously delegated ${String(network.chain.name)} tokens.`
		}
	};
};
