import { Box } from '@lucide/svelte';

import type { SearchResultPlugin } from '../types';
import { isSearchBlock } from '../validators';

/**
 * Block Search Plugin
 * Searches for blocks by number
 */
export const BlockPlugin: SearchResultPlugin = {
	name: 'block',
	priority: 20,

	matches: (query) => isSearchBlock(query),

	buildUrl: (value, context) => context.urlPath(`/${context.network}/block/${value}`),

	savesToHistory: true,

	ui: {
		icon: Box,
		formatDescription: () => 'View block'
	}
};
