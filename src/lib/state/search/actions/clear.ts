import { Trash } from '@lucide/svelte';

import type { SearchActionPlugin } from '../types';

/**
 * Clear History Action
 * Clears the search history when selected
 */
export const ClearAction: SearchActionPlugin = {
	name: 'clear',
	priority: 1000,

	keywords: ['clear', 'history'],
	value: 'Clear search history',
	description: 'Take Action',

	execute: (context) => {
		context.history.clear();
	},

	onSelect: () => true, // Keep dialog open after clearing history

	ui: {
		icon: Trash
	}
};
