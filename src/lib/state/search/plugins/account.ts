import { UserSearch } from '@lucide/svelte';
import type { SearchResultPlugin } from '../types';
import { isSearchAccount } from '../validators';

/**
 * Account Search Plugin
 * Searches for accounts by name
 */
export const AccountPlugin: SearchResultPlugin = {
	name: 'account',
	priority: 10,

	matches: (query) => isSearchAccount(query),

	buildUrl: (value, context) => context.urlPath(`/${context.network}/account/${value}`),

	savesToHistory: true,

	ui: {
		icon: UserSearch,
		formatDescription: () => 'View account'
	}
};
