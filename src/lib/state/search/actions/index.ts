import type { SearchActionPlugin } from '../types';
import { ClearAction } from './clear';
import { getPageActions } from './pages.svelte';

// Export individual actions
export { ClearAction } from './clear';
export { getPageActions } from './pages.svelte';

/**
 * Default action plugins registered in the search system.
 * Built per call so localized labels resolve against the active locale.
 * Sorted by priority (lower = higher priority).
 */
export function getDefaultActionPlugins(): SearchActionPlugin[] {
	return [
		...getPageActions(), // priority: 50
		ClearAction // priority: 1000
	];
}
