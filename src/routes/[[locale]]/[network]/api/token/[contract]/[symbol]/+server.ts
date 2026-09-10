import { json } from '@sveltejs/kit';
import { Asset, type AssetType, type NameType } from '@wharfkit/antelope';

import { NetworkState } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network }, params, url }: RequestEvent) {
	const contract = params.contract.toLocaleLowerCase();
	const symbol = params.symbol?.toLocaleUpperCase();
	const count = Number(url.searchParams.get('count')) || 100;
	const stats = await network.client.v1.chain.get_currency_stats(contract, symbol);
	if (stats[symbol] === undefined) {
		return json({ error: 'Token not found' }, { status: 404 });
	}
	let topholders: TokenHolders[] = [];
	let numholders: number = 0;
	if (network.supports('lightapi')) {
		topholders = await getTopHolders(network, contract, symbol, count);
		numholders = await getNumHolders(network, contract, symbol);
	}

	const supply = stats[symbol].supply;
	const locked = Asset.fromUnits(0, stats[symbol].supply.symbol);
	if (network.chain.systemToken && network.config.lockedsupply) {
		const promises = network.config.lockedsupply.map((account) =>
			network.client.v1.chain.get_currency_balance(contract, account, symbol)
		);
		const lockedaccounts = await Promise.all(promises);
		lockedaccounts.forEach((balance) => {
			if (balance.length) {
				supply.units.subtract(balance[0].units);
				locked.units.add(balance[0].units);
			}
		});
	}

	return json(
		{
			ts: new Date(),
			numholders,
			topholders,
			stats: {
				supply,
				locked,
				max_supply: stats[symbol].max_supply,
				issuer: stats[symbol].issuer
			}
		},
		{
			headers: getCacheHeaders(300)
		}
	);
}

interface TokenHolders {
	account: NameType;
	balance: AssetType;
}

async function getTopHolders(
	network: NetworkState,
	contract: string,
	symbol: string,
	number = 100
): Promise<TokenHolders[]> {
	// TODO: Remove this when the lightapi supports pathing to /vaulta URLs
	let shortname = String(network);
	if (shortname === 'vaulta') {
		// Force /vaulta to /eos in URLs for the lightapi
		shortname = 'eos';
	}
	const response = await network.fetch(
		`${network.config.endpoints.lightapi}/api/topholders/${shortname}/${contract}/${symbol}/${number}`
	);
	if (response.ok) {
		return (await response.json()).map((result: string[]) => ({
			account: result[0],
			balance: result[1]
		}));
	}
	return [];
}

async function getNumHolders(network: NetworkState, contract: string, symbol: string) {
	// TODO: Remove this when the lightapi supports pathing to /vaulta URLs
	let shortname = String(network);
	if (shortname === 'vaulta') {
		// Force /vaulta to /eos in URLs for the lightapi
		shortname = 'eos';
	}
	const response = await network.fetch(
		`${network.config.endpoints.lightapi}/api/holdercount/${shortname}/${contract}/${symbol}`
	);
	if (!response.ok) {
		return 0;
	}
	return response.json();
}
