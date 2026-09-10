import { Code } from '@lucide/svelte';

import type { SearchResultPlugin } from '../types';
import { isSearchAccount } from '../validators';

/**
 * Contract Search Plugin
 * Searches for contracts by account name (same validation as account)
 */
export const ContractPlugin: SearchResultPlugin = {
	name: 'contract',
	priority: 11,

	matches: (query) => isSearchAccount(query),

	buildUrl: (value, context) => context.urlPath(`/${context.network}/contract/${value}`),

	savesToHistory: true,

	ui: {
		icon: Code,
		formatDescription: () => 'View contract'
	}
};
