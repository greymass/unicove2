import type { API, Name } from '@wharfkit/antelope';

import type { NetworkState } from '$lib/state/network.svelte';
import * as SystemContract from '$lib/wharf/contracts/system';

export async function getProducersRecursive(
	network: NetworkState,
	loaded: SystemContract.Types.producer_info[] = []
): Promise<SystemContract.Types.producer_info[]> {
	const producers: SystemContract.Types.producer_info[] = [...loaded];
	const query: API.v1.GetTableRowsParamsTyped<Name> = {
		code: 'eosio',
		scope: 'eosio',
		table: 'producers',
		json: false,
		limit: 1000,
		type: SystemContract.Types.producer_info
	};
	if (producers.length) {
		query.lower_bound = producers[producers.length - 1].owner;
	}
	const results = await network.client.v1.chain.get_table_rows(query);
	results.rows.map((row) => {
		try {
			producers.push(SystemContract.Types.producer_info.from(row));
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			// console.error('Error processing', row, e);
		}
	});
	if (results.more) {
		return getProducersRecursive(network, producers);
	}
	return producers;
}
