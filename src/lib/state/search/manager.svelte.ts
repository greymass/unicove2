import { Debounced, watch } from 'runed';

import type { UnicoveContext } from '../client.svelte';
import { SearchCache } from './cache';
import { searchDebug } from './debug';
import { defaultRegistry, type SearchPluginRegistry } from './registry';
import { search } from './search';
import type { SearchRecord, SearchResultPlugin } from './types';

/**
 * Manages search state with debouncing and request cancellation.
 * Uses runed utilities for reactive state management.
 *
 * This class coordinates both synchronous (immediate) and asynchronous (debounced)
 * search plugins, ensuring results are displayed without race conditions.
 */
export class SearchManager {
	private query = $state('');
	public results = $state<SearchRecord[]>([]);
	public loading = $state<Record<string, boolean>>({});

	private registry: SearchPluginRegistry;
	private context: UnicoveContext;
	private cache = new SearchCache();
	private debouncedQueries = new Map<string, Debounced<string>>();
	private controllers = new Map<string, AbortController>();

	constructor(context: UnicoveContext, registry: SearchPluginRegistry = defaultRegistry) {
		this.context = context;
		this.registry = registry;
		this.setupWatchers();
	}

	private setupWatchers(): void {
		// Watch for immediate synchronous search
		watch(
			() => this.query,
			(query) => {
				searchDebug('Search', `Query changed to: "${query}"`);
				if (query) {
					this.results = search(this.context, query, this.registry);
				} else {
					this.results = this.context.history.get();
				}
			}
		);

		// Setup watchers for each enabled async plugin
		const asyncPlugins = this.registry.getAsyncResultPlugins(this.context);
		searchDebug(
			'Search',
			`Setting up ${asyncPlugins.length} async plugins:`,
			asyncPlugins.map((p) => p.name)
		);

		for (const plugin of asyncPlugins) {
			this.setupAsyncPluginWatcher(plugin);
		}
	}

	private setupAsyncPluginWatcher(plugin: SearchResultPlugin): void {
		if (!plugin.async) return;

		const { debounceMs, search: asyncSearch } = plugin.async;

		// Create debounced query for this plugin
		const debounced = new Debounced(() => this.query, debounceMs);
		this.debouncedQueries.set(plugin.name, debounced);

		// Watch the debounced query for this plugin
		watch(
			() => debounced.current,
			(query) => {
				// Skip empty queries
				if (!query) return;

				// Check if plugin should search for this query
				const applicable = this.registry.getApplicableAsyncPlugins(query, this.context);
				if (!applicable.some((p) => p.name === plugin.name)) {
					searchDebug(plugin.name, `Skipping search for: "${query}" (not applicable)`);
					return;
				}

				const cacheConfig = plugin.async?.cache;
				const chainId = this.context.network.chain.id.toString();

				// Check cache if enabled
				if (cacheConfig?.enabled) {
					const cached = this.cache.get(plugin.name, chainId, query);

					if (cached) {
						// Show cached results immediately
						searchDebug(plugin.name, `Showing cached results for: "${query}"`);
						this.results = this.dedupeAndSortResults([...this.results, ...cached]);

						// If fresh, skip API call
						if (!this.cache.isStale(plugin.name, chainId, query)) {
							searchDebug(plugin.name, `Using fresh cache for: "${query}"`);
							return;
						}

						// Stale cache - continue to fetch in background (SWR)
						searchDebug(plugin.name, `Stale cache, revalidating: "${query}"`);
					}
				}

				// Cancel previous request for this plugin
				const existingController = this.controllers.get(plugin.name);
				if (existingController) {
					searchDebug(plugin.name, 'Cancelling previous request');
					existingController.abort();
				}

				// Create new controller
				const controller = new AbortController();
				this.controllers.set(plugin.name, controller);
				this.loading[plugin.name] = true;

				searchDebug(plugin.name, `Starting async search for: "${query}"`);

				// Execute search
				asyncSearch(query, this.context, controller.signal)
					.then((pluginResults) => {
						// Only update if not aborted and query still matches
						if (!controller.signal.aborted && query === this.query) {
							searchDebug(plugin.name, `Received ${pluginResults.length} results for: "${query}"`);

							// Store in cache if enabled
							if (cacheConfig?.enabled) {
								this.cache.set(plugin.name, chainId, query, pluginResults);
							}

							// Replace old results from this plugin with fresh ones (Option A)
							const filteredResults = this.results.filter((r) => r.type !== plugin.name);
							this.results = this.dedupeAndSortResults([...filteredResults, ...pluginResults]);
						} else {
							searchDebug(
								plugin.name,
								`Discarding results for: "${query}" (query changed to "${this.query}")`
							);
						}
					})
					.catch((err) => {
						if (err.name !== 'AbortError') {
							console.error(`[${plugin.name}] Search error:`, err);
						}
					})
					.finally(() => {
						this.loading[plugin.name] = false;
					});
			}
		);
	}

	/**
	 * Deduplicate results by URL and sort by plugin priority.
	 * Keeps first occurrence when duplicates are found.
	 */
	private dedupeAndSortResults(results: SearchRecord[]): SearchRecord[] {
		// First deduplicate by URL
		const seen = new Set<string>();
		const deduped = results.filter((r) => {
			if (seen.has(r.url)) return false;
			seen.add(r.url);
			return true;
		});

		// Then sort by plugin priority
		return deduped.sort((a, b) => {
			const pluginA = this.registry.getResultPlugin(a.type);
			const pluginB = this.registry.getResultPlugin(b.type);
			const priorityA = pluginA?.priority ?? 999;
			const priorityB = pluginB?.priority ?? 999;
			return priorityA - priorityB;
		});
	}

	/**
	 * Update the search query
	 */
	setQuery(query: string): void {
		this.query = query;
	}

	/**
	 * Get the current query
	 */
	getQuery(): string {
		return this.query;
	}

	/**
	 * Check if any plugin is currently loading
	 */
	get isLoading(): boolean {
		return Object.values(this.loading).some((v) => v);
	}

	/**
	 * Cancel all in-flight requests
	 */
	cancelAll(): void {
		for (const controller of this.controllers.values()) {
			controller.abort();
		}
	}

	/**
	 * Clear search history and refresh results
	 */
	clearHistory(): void {
		this.context.history.clear();
		// Refresh results to reflect the cleared history
		if (!this.query) {
			this.results = [];
		}
	}

	/**
	 * Remove a single history item by index and refresh results
	 */
	removeHistoryItem(index: number): void {
		this.context.history.remove(index);
		// Refresh results to reflect the updated history
		if (!this.query) {
			this.results = this.context.history.get();
		}
	}

	/**
	 * Clean up resources
	 */
	destroy(): void {
		this.cancelAll();
	}
}
