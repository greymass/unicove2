import type { PageLoad } from './$types';
import { TokenDefinition } from '$lib/types/token';

export const load: PageLoad = async ({ params, parent }) => {
	const { account, network } = await parent();
	const def = TokenDefinition.from({
		chain: network.chain.id,
		contract: params.contract,
		symbol: params.symbol.toUpperCase()
	});
	const token = network.getToken(def);
	const balance = account.getBalance(token);
	return {
		balance,
		title: `Token Balance`,
		subtitle: `Token balance from the ${params.contract} smart contract.`,
		pageMetaTags: {
			title: `Token Balance`,
			description: `Token balance from the ${params.contract} smart contract.`
		}
	};
};
