import type { LayoutLoad } from './$types';
import { ogImageURL } from '$lib/utils/opengraph';
import { Token } from '$lib/types/token';
import { Asset, Name } from '@wharfkit/antelope';
import { useLocale } from '$lib/utils/intl';

export const load: LayoutLoad = async ({ url, params, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	let contract: Name | undefined;
	let symbol: Asset.Symbol | undefined;
	if (params.contract) {
		contract = Name.from(params.contract);
	}
	if (params.symbol) {
		symbol = Asset.Symbol.from(params.symbol.toUpperCase());
	}
	let token: Token | undefined;
	if (contract && symbol) {
		token = Token.from({
			id: {
				symbol,
				contract,
				chain: network.chain.id
			}
		});
	} else {
		// Default to the system contract
		contract = network.token.contract;
		symbol = network.token.symbol;
		token = network.token;
	}
	return {
		contract,
		symbol,
		token,
		title: `Send ${symbol.name} Tokens`,
		subtitle: 'Transfer tokens to another account.',
		pageMetaTags: {
			title: `Send ${symbol.name} Tokens`,
			description: `Transfer tokens from one account to another account on the ${network.chain.name} network using an ${network.chain.name} compatible wallet.`,
			open_graph_image: ogImageURL(url, {
				title: `Send ${symbol.name} Tokens`,
				text: 'Transfer tokens to another account.'
			})
		}
	};
};
