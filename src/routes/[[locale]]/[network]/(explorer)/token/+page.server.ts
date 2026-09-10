import type { Asset } from '@wharfkit/antelope';

import type { NetworkState } from '$lib/state/network.svelte';
import type { PageServerLoad } from './$types';

export interface TokenDirectoryRow {
	contract: string;
	symbol: string;
	name: string;
	url: string;
	holders?: number;
}

async function holderCount(
	network: NetworkState,
	contract: string,
	symbol: string
): Promise<number | undefined> {
	// TODO: Remove this when the lightapi supports pathing to /vaulta URLs
	let shortname = String(network);
	if (shortname === 'vaulta') {
		shortname = 'eos';
	}
	try {
		const response = await network.fetch(
			`${network.config.endpoints.lightapi}/api/holdercount/${shortname}/${contract}/${symbol}`
		);
		if (!response.ok) {
			return undefined;
		}
		const count = await response.json();
		return typeof count === 'number' && count > 0 ? count : undefined;
	} catch {
		return undefined;
	}
}

export const load: PageServerLoad = async ({ locals: { network } }) => {
	const seen = new Set<string>();
	const rows: TokenDirectoryRow[] = [];

	function add(contract: string | undefined, symbol: Asset.Symbol) {
		if (!contract) return;
		const key = `${contract}/${symbol.name}`;
		if (seen.has(key)) return;
		seen.add(key);
		rows.push({
			contract,
			symbol: String(symbol),
			name: String(symbol.name),
			url: `${contract}/${symbol.name.toLowerCase()}`
		});
	}

	add(String(network.getSystemToken().id.contract), network.getSystemToken().id.symbol);
	const legacy = network.getLegacyToken();
	if (legacy) {
		add(String(legacy.id.contract), legacy.id.symbol);
	}
	if (network.supports('rammarket')) {
		const ram = network.getRamToken();
		add(String(ram.id.contract), ram.id.symbol);
	}
	if (network.supports('wram')) {
		const wram = network.getWRAMToken();
		add(String(wram.id.contract), wram.id.symbol);
	}
	for (const token of network.config.tokens) {
		add(token.contract ? String(token.contract) : undefined, token.symbol);
	}

	if (network.supports('lightapi') && network.config.endpoints.lightapi) {
		await Promise.all(
			rows.map(async (row) => {
				row.holders = await holderCount(network, row.contract, row.name);
			})
		);
	}

	return { tokens: rows };
};
