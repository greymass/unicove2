import { API, type AssetType, type NameType } from '@wharfkit/antelope';
import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';
import { LightAPIBalance } from '$lib/types';
import { localizePath } from '$lib/utils/url';

interface LightAPIHolder {
	account: NameType;
	balance: AssetType;
}

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
	const { network } = await parent();

	const count = Number(url.searchParams.get('count')) || 100;
	const baseUrl = localizePath(`/api/token/${params.contract}/${params.symbol}?count=${count}`);
	const response = await fetch(baseUrl);
	if (!response.ok) {
		return error(404, {
			message: 'Token not found',
			code: 'NOT_FOUND',
			title: `${params.contract}:${params.symbol}`,
			subtitle: 'Token'
		});
	}
	const json = await response.json();

	const stats = API.v1.GetCurrencyStatsItemResponse.from(json.stats);
	const topholders = json.topholders.map((result: LightAPIHolder) => {
		return LightAPIBalance.from({
			account: result.account,
			balance: `${result.balance} ${stats.max_supply.symbol.code}`
		});
	});

	// Prevent loading more than 1000 entries since the API ends at 1000
	const loadMoreUrl =
		count < 1000
			? `/${network}/token/${params.contract}/${params.symbol}?count=${count + 100}`
			: undefined;

	return {
		numholders: json.numholders,
		topholders,
		stats,
		loadMoreUrl,
		title: `${stats.supply.symbol.name} Token`,
		subtitle: `A token on the ${params.contract} smart contract.`,
		pageMetaTags: {
			title: `${stats.supply.symbol.name} Token`,
			description: `The ${stats.supply.symbol.name} token created by the ${params.contract} smart contract on the ${network.chain.name} network. ${stats.supply.symbol.name} has ${json.numholders} accounts currently holding a balance.`
		}
	};
};
