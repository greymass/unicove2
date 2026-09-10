import type { Icon } from '@lucide/svelte';
import type { UnicoveContext } from '../client.svelte';

/**
 * A single search result record
 */
export interface SearchRecord {
	/** Plugin name that produced this result */
	type: string;
	/** Display value for the result */
	value: string;
	/** Description shown in search results */
	description?: string;
	/** URL to navigate to when selected */
	url: string;
	/** Arbitrary data field for storing additional info */
	data?: unknown;
	/** Keywords for matching */
	keywords?: string[];
}

/**
 * Plugin interface for search result types.
 * Defines how a search result type behaves, including validation, search, URL generation, and UI rendering.
 */
export interface SearchResultPlugin {
	/** Unique identifier for this plugin */
	name: string;
	/** Sort priority (lower = appears first in results) */
	priority: number;
	/** Is this plugin enabled for the given context? */
	enabled?: (context: UnicoveContext) => boolean;
	/** Can this query produce results of this type? */
	matches: (query: string, context: UnicoveContext) => boolean;
	/** Generate the URL for a value of this type */
	buildUrl: (value: string, context: UnicoveContext) => string;
	/** Synchronous search - returns results immediately */
	search?: (query: string, context: UnicoveContext) => SearchRecord[];
	/** Async search configuration */
	async?: {
		debounceMs: number;
		minQueryLength?: number;
		search: (
			query: string,
			context: UnicoveContext,
			signal?: AbortSignal
		) => Promise<SearchRecord[]>;
		/** Cache configuration (opt-in) */
		cache?: {
			/** Enable caching for this plugin */
			enabled: boolean;
			/** Custom TTL in milliseconds (default: 300000 = 5 minutes) */
			ttlMs?: number;
		};
	};
	/** Whether results should be saved to history (default: false) */
	savesToHistory?: boolean;
	/**
	 * Custom handler when result is selected.
	 * Called before default navigation behavior.
	 * Return true to keep dialog open, false/undefined to close.
	 */
	onSelect?: (
		record: SearchRecord,
		context: UnicoveContext
	) => boolean | void | Promise<boolean | void>;
	/** UI rendering configuration */
	ui: {
		/** Lucide icon component */
		icon: typeof Icon;
		/** Format the display value (defaults to record.value) */
		formatValue?: (record: SearchRecord) => string;
		/** Format the description (defaults to record.description or "View {type}") */
		formatDescription?: (record: SearchRecord) => string;
		/** Truncation: false, true (end), 'center', or max chars */
		truncate?: boolean | 'center' | number;
	};
}

/**
 * Plugin interface for search actions.
 * Actions execute operations (clear history, navigate to pages) instead of searching for entities.
 */
export interface SearchActionPlugin {
	/** Unique identifier for this action */
	name: string;
	/** Sort priority */
	priority: number;
	/** Is this action enabled? */
	enabled?: (context: UnicoveContext) => boolean;
	/** Keywords that trigger this action in search */
	keywords: string[];
	/** Display value shown in search results */
	value: string;
	/** Description shown in search results */
	description: string;
	/** Execute the action */
	execute: (context: UnicoveContext) => void | Promise<void>;
	/**
	 * Custom handler after action executes.
	 * Return true to keep dialog open, false/undefined to close.
	 */
	onSelect?: (context: UnicoveContext) => boolean | void | Promise<boolean | void>;
	/** UI configuration */
	ui: {
		/** Lucide icon component */
		icon: typeof Icon;
	};
}
