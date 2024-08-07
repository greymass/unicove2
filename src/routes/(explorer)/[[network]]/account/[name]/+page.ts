import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { AccountState } from '$lib/state/client/account.svelte';
import { getChainDefinitionFromParams } from '$lib/state/network.svelte';

export const load: PageLoad = async ({ fetch, params }) => {
	const chain = getChainDefinitionFromParams(params.network);
	const account = await AccountState.for(chain, params.name, fetch);
	return {
		account,
		name: params.name
	};
};
