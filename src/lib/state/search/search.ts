import type { UnicoveContext } from '../client.svelte';
import type { SearchPluginRegistry } from './registry';
import { searchHistory } from './storage.svelte';
import type { SearchRecord } from './types';

/**
 * Performs synchronous search across all sources using the plugin registry.
 * Async sources are handled separately by SearchManager.
 */
export function search(
	context: UnicoveContext,
	query: string,
	registry: SearchPluginRegistry
): SearchRecord[] {
	const results: SearchRecord[] = [];

	// Run all synchronous plugin searches
	const syncPlugins = registry.getSyncResultPlugins(context);
	for (const plugin of syncPlugins) {
		if (plugin.search) {
			results.push(...plugin.search(query, context));
		}
	}

	// Search for matching types based on query validators
	results.push(...searchSuggestions(query, context, registry));

	// Search action plugins (page navigation, etc.)
	results.push(...registry.searchActions(query, context));

	// Search recent history
	results.push(...searchHistory(query, context.history));

	return results;
}

/**
 * Generate search suggestions based on what type of value was entered.
 * Uses plugins to determine which types match and generate URLs.
 * Excludes:
 * - Plugins with custom search() functions (they produce their own results)
 * - Async-only plugins (those that only have async search)
 */
export function searchSuggestions(
	query: string,
	context: UnicoveContext,
	registry: SearchPluginRegistry
): SearchRecord[] {
	const matchingPlugins = registry.getMatchingResultPlugins(query, context);

	// Only include plugins that have neither sync search nor async search
	// These are "validator-only" plugins that just match input and build URLs
	const validatorOnlyPlugins = matchingPlugins.filter((plugin) => {
		return !plugin.search && !plugin.async;
	});

	return validatorOnlyPlugins.map((plugin) => ({
		type: plugin.name,
		value: query,
		description: plugin.ui.formatDescription?.({ type: plugin.name, value: query, url: '' }),
		url: plugin.buildUrl(query, context)
	}));
}
