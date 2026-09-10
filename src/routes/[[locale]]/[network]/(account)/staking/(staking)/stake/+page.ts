import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Stake',
		subtitle: `Stake ${String(network.token.symbol.name)} Tokens`,
		backPath: `/${network}/staking`,
		pageMetaTags: {
			title: `Stake ${String(network.token.symbol.name)} Tokens`,
			description: `Stake ${String(network.token.symbol.name)} tokens and earn rewards using an ${String(network.chain.name)} compatible wallet.`
		}
	};
};
