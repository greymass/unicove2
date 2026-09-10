import { File } from '@lucide/svelte';
import { goto } from '$app/navigation';

import type { UnicoveContext } from '$lib/state/client.svelte';
import type { SearchActionPlugin } from '../types';

interface PageActionConfig {
	name: string;
	keywords: string[];
	value: string;
	description: string;
	path: string;
	enabled?: (context: UnicoveContext) => boolean;
}

function createPageAction(config: PageActionConfig): SearchActionPlugin {
	return {
		name: config.name,
		priority: 50,
		enabled: (context) =>
			!!context.settings.data.searchShowPages && (config.enabled?.(context) ?? true),
		keywords: config.keywords,
		value: config.value,
		description: config.description,
		execute: (context) => goto(context.urlPath(`/${context.network}${config.path}`)),
		ui: { icon: File }
	};
}

export function getPageActions(): SearchActionPlugin[] {
	return [
		createPageAction({
			name: 'ram-market',
			keywords: ['ram'],
			value: 'RAM Market Overview',
			description: 'View Page',
			path: '/ram',
			enabled: (context) => context.network.supports('rammarket')
		}),
		createPageAction({
			name: 'buy-ram',
			keywords: ['ram', 'buy'],
			value: 'Purchase RAM',
			description: 'View Page',
			path: '/ram/buy',
			enabled: (context) => context.network.supports('rammarket')
		}),
		createPageAction({
			name: 'sell-ram',
			keywords: ['ram', 'sell'],
			value: 'Sell RAM',
			description: 'View Page',
			path: '/ram/sell',
			enabled: (context) => context.network.supports('rammarket')
		}),
		createPageAction({
			name: 'send',
			keywords: ['send', 'transfer'],
			value: 'Send tokens',
			description: 'View Page',
			path: '/send'
		}),
		createPageAction({
			name: 'settings',
			keywords: ['settings', 'preferences'],
			value: 'Unicove settings',
			description: 'View Page',
			path: '/settings'
		}),
		createPageAction({
			name: 'staking',
			keywords: ['staking', 'stake'],
			value: 'Staking overview',
			description: 'View Page',
			path: '/staking',
			enabled: (context) => context.network.supports('staking')
		}),
		createPageAction({
			name: 'stake',
			keywords: ['stake'],
			value: 'Stake Tokens',
			description: 'View Page',
			path: '/staking/stake',
			enabled: (context) => context.network.supports('staking')
		}),
		createPageAction({
			name: 'unstake',
			keywords: ['unstake'],
			value: 'Unstake tokens',
			description: 'View Page',
			path: '/staking/unstake',
			enabled: (context) => context.network.supports('staking')
		}),
		createPageAction({
			name: 'resources',
			keywords: ['resources', 'cpu', 'net', 'powerup'],
			value: 'Manage CPU/NET',
			description: 'View Page',
			path: '/resources'
		}),
		createPageAction({
			name: 'tools',
			keywords: ['tools'],
			value: 'Tools',
			description: 'View Page',
			path: '/tools'
		}),
		createPageAction({
			name: 'swap',
			keywords: ['swap', 'convert', 'exchange'],
			value: 'Swap tokens',
			description: 'View Page',
			path: '/swap'
		}),
		createPageAction({
			name: 'bidname',
			keywords: ['bidname', 'bid', 'names', 'premium'],
			value: 'Name Bids',
			description: 'View Page',
			path: '/bidname',
			enabled: (context) => context.network.supports('bidname')
		}),
		createPageAction({
			name: 'fund',
			keywords: ['fund', 'buy', 'onramp', 'card'],
			value: 'Add Funds',
			description: 'View Page',
			path: '/fund',
			enabled: (context) => context.network.supports('directfunding')
		}),
		createPageAction({
			name: 'undelegate',
			keywords: ['undelegate', 'delegated', 'reclaim'],
			value: 'Undelegate tokens',
			description: 'View Page',
			path: '/undelegate'
		}),
		createPageAction({
			name: 'refund',
			keywords: ['refund', 'unstaked'],
			value: 'Claim refund',
			description: 'View Page',
			path: '/refund'
		}),
		createPageAction({
			name: 'transaction-status',
			keywords: ['transactions', 'status', 'pending'],
			value: 'Transaction Status',
			description: 'View Page',
			path: '/transactions'
		}),
		createPageAction({
			name: 'deploy-contract',
			keywords: ['deploy', 'upload', 'contract', 'abi'],
			value: 'Deploy Contract',
			description: 'View Page',
			path: '/upload'
		}),
		createPageAction({
			name: 'create-account',
			keywords: ['create', 'account', 'new'],
			value: 'Create Account',
			description: 'View Page',
			path: '/create-account'
		}),
		createPageAction({
			name: 'network',
			keywords: ['network', 'stats', 'chain'],
			value: 'Network overview',
			description: 'View Page',
			path: '/network'
		}),
		createPageAction({
			name: 'governance',
			keywords: ['governance', 'vote', 'voting'],
			value: 'Governance',
			description: 'View Page',
			path: '/governance'
		}),
		createPageAction({
			name: 'producers',
			keywords: ['producers', 'vote', 'voting', 'block producers'],
			value: 'Producer voting',
			description: 'View Page',
			path: '/producers'
		}),
		createPageAction({
			name: 'tokens-index',
			keywords: ['tokens', 'directory'],
			value: 'Tokens',
			description: 'View Page',
			path: '/token'
		}),
		createPageAction({
			name: 'contracts-index',
			keywords: ['contracts', 'leaderboard'],
			value: 'Contracts',
			description: 'View Page',
			path: '/contract',
			enabled: (context) => context.network.supports('statindex')
		}),
		createPageAction({
			name: 'accounts-index',
			keywords: ['accounts', 'leaderboard'],
			value: 'Accounts',
			description: 'View Page',
			path: '/account',
			enabled: (context) => context.network.supports('statindex')
		})
	];
}
