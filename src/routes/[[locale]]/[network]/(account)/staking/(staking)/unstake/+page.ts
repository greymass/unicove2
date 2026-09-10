import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Unstake',
		subtitle: `Unstake ${String(network.chain.systemToken?.symbol.name)} tokens`,
		backPath: `/${network}/staking`,
		pageMetaTags: {
			title: `Unstake ${String(network.chain.systemToken?.symbol.name)} tokens`,
			description: `Unstake ${String(network.chain.systemToken?.symbol.name)} tokens and begin claiming the balance of your rewards using an ${String(network.chain.name)} compatible wallet.`
		}
	};
};
