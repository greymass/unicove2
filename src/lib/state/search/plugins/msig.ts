import type { Proposal } from '@wharfkit/msigs';
import { UserCheck } from '@lucide/svelte';

import { searchDebug } from '../debug';
import type { SearchResultPlugin } from '../types';
import { isSearchAccount } from '../validators';

/**
 * Multisig Proposal Search Plugin
 * Searches for msig proposals matching the query (async)
 */
export const MsigPlugin: SearchResultPlugin = {
	name: 'msig',
	priority: 60,

	enabled: (context) => !!context.network.msigs,

	matches: (query) => {
		// Only search if query looks like it could be an account or proposal name
		return isSearchAccount(query) || query.includes(':');
	},

	buildUrl: (value, context) => {
		const [proposer, name] = value.split(':');
		return context.urlPath(`/${context.network}/msig/${proposer}/${name}`);
	},

	async: {
		debounceMs: 300,
		minQueryLength: 2,
		cache: {
			enabled: true
		},
		search: async (query, context, signal) => {
			const { network, urlPath } = context;
			try {
				if (signal?.aborted) return [];

				searchDebug('Msig Search', `Searching for: "${query}"`);
				const response = await network.msigs.search_proposals(query, { limit: 10 });

				if (signal?.aborted) {
					searchDebug('Msig Search', `Request aborted for: "${query}"`);
					return [];
				}

				searchDebug('Msig Search', `Found ${response.proposals.length} results for: "${query}"`);
				return response.proposals
					.sort((a, b) => {
						// Sort by created_at, newest first
						const dateA = new Date(String(a.created_at)).getTime();
						const dateB = new Date(String(b.created_at)).getTime();
						return dateB - dateA;
					})
					.map((proposal: Proposal) => ({
						type: 'msig',
						value: `${proposal.proposer}:${proposal.proposal_name}`,
						url: urlPath(`/${network}/msig/${proposal.proposer}/${proposal.proposal_name}`)
					}));
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') {
					searchDebug('Msig Search', `Request aborted for: "${query}"`);
					return [];
				}
				console.error('[Msig Search] Error:', error);
				return [];
			}
		}
	},

	savesToHistory: true,

	ui: {
		icon: UserCheck,
		formatDescription: () => 'View proposal'
	}
};
