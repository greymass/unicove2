import type { UnicoveContext } from '../client.svelte';
import type { SearchActionPlugin, SearchRecord, SearchResultPlugin } from './types';

import { getDefaultActionPlugins } from './actions';
import { defaultResultPlugins } from './plugins';

/**
 * Registry for managing search plugins (both result and action plugins).
 * Provides methods to query plugins, execute searches, and perform actions.
 * Action plugins may be provided as a factory so localized labels resolve per call.
 */
export class SearchPluginRegistry {
	private resultPlugins: Map<string, SearchResultPlugin> = new Map();
	private actionPlugins: SearchActionPlugin[] = [];
	private actionFactory?: () => SearchActionPlugin[];

	constructor(
		resultPlugins: SearchResultPlugin[] = [],
		actionPlugins: SearchActionPlugin[] | (() => SearchActionPlugin[]) = []
	) {
		for (const plugin of resultPlugins) {
			this.registerResult(plugin);
		}
		if (typeof actionPlugins === 'function') {
			this.actionFactory = actionPlugins;
		} else {
			for (const action of actionPlugins) {
				this.registerAction(action);
			}
		}
	}

	/**
	 * Register a result plugin
	 */
	registerResult(plugin: SearchResultPlugin): void {
		this.resultPlugins.set(plugin.name, plugin);
	}

	/**
	 * Register an action plugin
	 */
	registerAction(plugin: SearchActionPlugin): void {
		this.actionPlugins.push(plugin);
		// Sort by priority after adding
		this.actionPlugins.sort((a, b) => a.priority - b.priority);
	}

	/**
	 * Get a specific result plugin by type
	 */
	getResultPlugin(type: string): SearchResultPlugin | undefined {
		return this.resultPlugins.get(type);
	}

	/**
	 * Get all result plugins that are enabled for the given context
	 */
	getEnabledResultPlugins(context: UnicoveContext): SearchResultPlugin[] {
		return Array.from(this.resultPlugins.values())
			.filter((p) => !p.enabled || p.enabled(context))
			.sort((a, b) => a.priority - b.priority);
	}

	/**
	 * Get result plugins that match the given query
	 */
	getMatchingResultPlugins(query: string, context: UnicoveContext): SearchResultPlugin[] {
		return this.getEnabledResultPlugins(context).filter((p) => p.matches(query, context));
	}

	/**
	 * Get all result plugins that have synchronous search
	 */
	getSyncResultPlugins(context: UnicoveContext): SearchResultPlugin[] {
		return this.getEnabledResultPlugins(context).filter((p) => p.search);
	}

	/**
	 * Get all result plugins that have async search
	 */
	getAsyncResultPlugins(context: UnicoveContext): SearchResultPlugin[] {
		return this.getEnabledResultPlugins(context).filter((p) => p.async);
	}

	/**
	 * Get async plugins that should search for the given query
	 */
	getApplicableAsyncPlugins(query: string, context: UnicoveContext): SearchResultPlugin[] {
		return this.getAsyncResultPlugins(context).filter((plugin) => {
			if (!plugin.async) return false;
			if (plugin.async.minQueryLength && query.length < plugin.async.minQueryLength) {
				return false;
			}
			if (!plugin.matches(query, context)) {
				return false;
			}
			return true;
		});
	}

	/**
	 * Get all action plugins that are enabled for the given context
	 */
	getEnabledActionPlugins(context: UnicoveContext): SearchActionPlugin[] {
		const plugins = this.actionFactory
			? [...this.actionFactory(), ...this.actionPlugins].sort((a, b) => a.priority - b.priority)
			: this.actionPlugins;
		return plugins.filter((a) => !a.enabled || a.enabled(context));
	}

	/**
	 * Search actions by matching keywords against the query
	 */
	searchActions(query: string, context: UnicoveContext): SearchRecord[] {
		const normalizedQuery = query.trim().toLowerCase();
		return this.getEnabledActionPlugins(context)
			.filter((action) =>
				action.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery))
			)
			.map((action) => ({
				type: action.name,
				value: action.value,
				description: action.description,
				url: '', // Actions don't navigate via URL
				data: action // Store the action for later execution
			}));
	}
}

/**
 * Default registry instance with all built-in plugins and actions.
 * This creates a singleton that can be imported and used throughout the app.
 */
export const defaultRegistry = new SearchPluginRegistry(
	defaultResultPlugins,
	getDefaultActionPlugins
);
