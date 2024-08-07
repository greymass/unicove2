import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getNetwork(chain, fetch);
	if (!network.resources) {
		return json({ error: 'Network resources not initialized' }, { status: 500 });
	}

	const requests: unknown[] = [
		network.resources.v1.ram.get_state(),
		network.resources.v1.rex.get_state()
	];

	if (network.contracts.delphioracle) {
		requests.push(network.contracts.delphioracle.table('datapoints', 'eosusd').get());
	}

	const [ramstate, rexstate, tokenstate] = await Promise.all(requests);

	return json({
		ts: new Date(),
		ramstate,
		rexstate,
		tokenstate
	});
}
