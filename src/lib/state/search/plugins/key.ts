import { KeyRound } from '@lucide/svelte';

import type { SearchResultPlugin } from '../types';
import { isSearchKey } from '../validators';

/**
 * Key Search Plugin
 * Searches for public keys
 */
export const KeyPlugin: SearchResultPlugin = {
	name: 'key',
	priority: 30,

	matches: (query) => isSearchKey(query),

	buildUrl: (value, context) => context.urlPath(`/${context.network}/key/${value}`),

	savesToHistory: true,

	ui: {
		icon: KeyRound,
		formatDescription: () => 'View key',
		truncate: 12 // Truncate to 12 characters
	}
};
