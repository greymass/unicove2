import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	return {
		title: `${network.chain.name} Network Staking`,
		subtitle: `Stake ${network.chain.systemToken?.symbol.name || 'tokens'} to earn rewards.`,
		pageMetaTags: {
			title: `${network.chain.name} Network Staking`,
			description: `An overview of staking on the ${network.chain.name} network providing easy access to stake, unstake, and withdraw ${network.chain.systemToken?.symbol.name || 'tokens'} tokens using an ${network.chain.name} compatible wallet.`
		}
	};
};
