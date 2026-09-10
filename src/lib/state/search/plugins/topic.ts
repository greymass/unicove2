import { Scale } from '@lucide/svelte';

import { searchDebug } from '../debug';
import type { SearchResultPlugin } from '../types';

/**
 * Topic Search Plugin
 * Searches for sentiment topics that actually exist in the sentiment contract (async)
 */
export const TopicPlugin: SearchResultPlugin = {
	name: 'topic',
	priority: 50,

	enabled: (context) => context.network.config.features.sentiment,

	matches: (query, context) => {
		// Basic validation - async search will filter to actual topics
		return context.network.config.features.sentiment && query.length >= 2;
	},

	buildUrl: (value, context) => context.urlPath(`/${context.network}/topics/${value}`),

	async: {
		debounceMs: 300,
		minQueryLength: 2,
		cache: {
			enabled: true
		},
		search: async (query, context, signal) => {
			try {
				if (signal?.aborted) return [];

				searchDebug('Topic Search', `Searching for: "${query}"`);
				const response = await context.network.contracts.sentiment.readonly('gettopics');

				if (signal?.aborted) {
					searchDebug('Topic Search', `Request aborted for: "${query}"`);
					return [];
				}

				const queryLower = query.toLowerCase();
				const matches = response
					.filter((topic) => topic.id.toString().toLowerCase().includes(queryLower))
					.slice(0, 10) // Limit to 10 results like MSIG
					.map((topic) => ({
						type: 'topic',
						value: topic.id.toString(),
						description: topic.description,
						url: context.urlPath(`/${context.network}/topics/${topic.id}`)
					}));

				searchDebug('Topic Search', `Found ${matches.length} results for: "${query}"`);
				return matches;
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') {
					searchDebug('Topic Search', `Request aborted for: "${query}"`);
					return [];
				}
				console.error('[Topic Search] Error:', error);
				return [];
			}
		}
	},

	savesToHistory: true,

	ui: {
		icon: Scale,
		formatDescription: () => 'View topic'
	}
};
