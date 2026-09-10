import { searchDebug } from './debug';
import type { SearchRecord } from './types';

interface CacheEntry {
	results: SearchRecord[];
	timestamp: number;
}

interface CacheConfig {
	ttlMs: number;
	maxEntriesPerPlugin: number;
}

const DEFAULT_CONFIG: CacheConfig = {
	ttlMs: 5 * 60 * 1000, // 5 minutes
	maxEntriesPerPlugin: 50
};

/**
 * In-memory cache for async search results with TTL and stale-while-revalidate support.
 * Cache keys are scoped by plugin name, chain ID, and normalized query.
 */
export class SearchCache {
	// Map<"pluginName:chainId:query", CacheEntry>
	private cache = new Map<string, CacheEntry>();
	private config: CacheConfig;

	constructor(config?: Partial<CacheConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	private makeKey(pluginName: string, chainId: string, query: string): string {
		return `${pluginName}:${chainId}:${query.toLowerCase().trim()}`;
	}

	/**
	 * Get cached results for a plugin and query.
	 * Returns null if no cache entry exists.
	 */
	get(pluginName: string, chainId: string, query: string): SearchRecord[] | null {
		const key = this.makeKey(pluginName, chainId, query);
		const entry = this.cache.get(key);

		if (!entry) {
			searchDebug('Cache', `MISS [${pluginName}] "${query}"`);
			return null;
		}

		searchDebug('Cache', `HIT [${pluginName}] "${query}" (${entry.results.length} results)`);
		return entry.results;
	}

	/**
	 * Store search results in cache.
	 * Automatically evicts oldest entries if max per plugin is exceeded.
	 */
	set(pluginName: string, chainId: string, query: string, results: SearchRecord[]): void {
		const key = this.makeKey(pluginName, chainId, query);
		this.cache.set(key, { results, timestamp: Date.now() });
		searchDebug('Cache', `SET [${pluginName}] "${query}" (${results.length} results)`);
		this.evictOldEntries(pluginName, chainId);
	}

	/**
	 * Check if a cache entry is stale (older than TTL).
	 * Returns true if entry doesn't exist or is expired.
	 */
	isStale(pluginName: string, chainId: string, query: string): boolean {
		const key = this.makeKey(pluginName, chainId, query);
		const entry = this.cache.get(key);
		if (!entry) return true;
		return Date.now() - entry.timestamp > this.config.ttlMs;
	}

	/**
	 * Evict oldest entries when exceeding max per plugin.
	 */
	private evictOldEntries(pluginName: string, chainId: string): void {
		const prefix = `${pluginName}:${chainId}:`;
		const pluginEntries: [string, CacheEntry][] = [];

		for (const [key, entry] of this.cache.entries()) {
			if (key.startsWith(prefix)) {
				pluginEntries.push([key, entry]);
			}
		}

		if (pluginEntries.length > this.config.maxEntriesPerPlugin) {
			// Sort by timestamp, oldest first
			pluginEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
			const toEvict = pluginEntries.length - this.config.maxEntriesPerPlugin;
			for (let i = 0; i < toEvict; i++) {
				this.cache.delete(pluginEntries[i][0]);
				searchDebug('Cache', `EVICT [${pluginName}] oldest entry`);
			}
		}
	}

	/**
	 * Clear cache entries for a specific plugin or all plugins.
	 */
	clear(pluginName?: string): void {
		if (pluginName) {
			for (const key of this.cache.keys()) {
				if (key.startsWith(`${pluginName}:`)) {
					this.cache.delete(key);
				}
			}
		} else {
			this.cache.clear();
		}
	}
}
