import { Boxes } from '@lucide/svelte';

import { truncateCenter } from '$lib/utils';
import type { SearchResultPlugin } from '../types';
import { isSearchTransaction } from '../validators';

/**
 * Transaction Search Plugin
 * Searches for transactions by ID
 */
export const TransactionPlugin: SearchResultPlugin = {
	name: 'transaction',
	priority: 40,

	matches: (query) => isSearchTransaction(query),

	buildUrl: (value, context) => context.urlPath(`/${context.network}/transaction/${value}`),

	savesToHistory: true,

	ui: {
		icon: Boxes,
		formatValue: (record) => truncateCenter(record.value),
		formatDescription: () => 'View transaction',
		truncate: 13 // Truncate to 13 characters
	}
};
