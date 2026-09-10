import type { PageLoad } from './$types';
import { TokenDefinition } from '$lib/types/token';
import { describeTokens } from '../../../../describe.svelte';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	const { basecontract, basesymbol, quotecontract, quotesymbol } = params;
	const base = network.getToken(
		TokenDefinition.from({
			contract: basecontract,
			symbol: basesymbol.toUpperCase(),
			chain: network.chain.id
		})
	);
	const quote = network.getToken(
		TokenDefinition.from({
			contract: quotecontract,
			symbol: quotesymbol.toUpperCase(),
			chain: network.chain.id
		})
	);
	const describe = describeTokens(network, base, quote);
	return {
		base,
		quote,
		title: describe.title,
		subtitle: describe.summary,
		pageMetaTags: {
			title: describe.title,
			description: describe.summary
		}
	};
};
