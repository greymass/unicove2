import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Withdraw',
		subtitle: `Withdraw ${String(network.chain.systemToken?.symbol.name)} tokens from staking`,
		backPath: `/${network}/staking`,
		pageMetaTags: {
			title: `Withdraw ${String(network.chain.systemToken?.symbol.name)} tokens from staking`,
			description: `Withdraw ${String(network.chain.systemToken?.symbol.name)} tokens from the staking contract to add them to your available balance using an ${String(network.chain.name)} compatible wallet.`
		}
	};
};
