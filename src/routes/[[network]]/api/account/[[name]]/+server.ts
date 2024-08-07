import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import type { NameType } from '@wharfkit/antelope';
import type { ChainDefinition } from '@wharfkit/session';
import { chainMapper } from '$lib/wharf/chains.js';

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getNetwork(chain, fetch);
	const { system: systemContract } = network.contracts;

	const requests = [
		network.client.v1.chain.get_account(params.name),
		systemContract.table('delband').all({ scope: params.name }),
		systemContract.table('rexbal').get(params.name)
	];

	if (network.config.features.lightapi) {
		requests.push(loadBalances(chain, params.name, fetch));
	}

	try {
		const [account_data, delegated, rex, light_api_response] = await Promise.all(requests);
		return json({
			ts: new Date(),
			account_data,
			balances: light_api_response ? light_api_response.balances : [],
			delegated,
			rex
		});
	} catch (error) {
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
}

async function loadBalances(chain: ChainDefinition, account: NameType, f: typeof fetch) {
	const network = chainMapper.toShortName(String(chain.id));
	const result = await f(`https://balances.unicove.com/api/balances/${network}/${account}`);
	return result.json();
}
