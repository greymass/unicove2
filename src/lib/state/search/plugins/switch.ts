import { ArrowLeftRight } from '@lucide/svelte';
import { goto } from '$app/navigation';

import type { SearchResultPlugin } from '../types';
import type { SerializedSession } from '@wharfkit/session';

/**
 * Account Switch Plugin
 * Searches logged-in accounts for quick switching
 * Note: This has custom search logic in search.ts (searchAccounts function)
 */
export const SwitchPlugin: SearchResultPlugin = {
	name: 'switch',
	priority: 5,

	enabled: (context) => !!context.settings.data.searchAccountSwitch,

	matches: (query, context) => {
		// Check if any logged-in sessions match the query
		return context.wharf.sessions.some(
			(s) =>
				context.network.chain.id.equals(s.chain) &&
				String(s.actor).includes(query.trim().toLowerCase())
		);
	},

	buildUrl: (value, context) => {
		// Extract actor name from "actor@permission" format
		const actor = value.split('@')[0];
		return context.urlPath(`/${context.network}/account/${actor}`);
	},

	search: (query, context) => {
		const { network, wharf, urlPath } = context;
		return wharf.sessions
			.filter((s) => network.chain.id.equals(s.chain))
			.filter((s) => String(s.actor).includes(query.trim().toLowerCase()))
			.map((s) => ({
				data: s,
				description: 'Switch Account',
				type: 'switch',
				value: `${s.actor}@${s.permission}`,
				url: urlPath(`/${network}/account/${s.actor}`)
			}));
	},

	onSelect: (record, context) => {
		// Switch the active session
		context.wharf.switch(record.data as SerializedSession);
		// Navigate if allowed by settings
		if (!context.settings.data.preventAccountPageSwitching) {
			goto(record.url);
		}
		// Don't keep dialog open
		return false;
	},

	savesToHistory: false, // Don't save account switches to history

	ui: {
		icon: ArrowLeftRight,
		formatDescription: () => 'Switch Account'
	}
};
