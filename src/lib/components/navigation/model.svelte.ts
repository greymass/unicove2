import {
	ArrowLeftRightIcon,
	CoinsIcon,
	FileCodeIcon,
	GlobeIcon,
	LandmarkIcon,
	LayersIcon,
	MemoryStickIcon,
	SendIcon,
	SettingsIcon,
	UserIcon,
	UsersIcon,
	WrenchIcon,
	ZapIcon
} from '@lucide/svelte';
import type { UnicoveContext } from '$lib/state/client.svelte';
import type { NetworkState } from '$lib/state/network.svelte';

export interface NavItem {
	href: string;
	text: string;
	icon?: typeof SendIcon;
	bar?: boolean;
	match?: string[];
	description?: string;
	signIn?: boolean;
}

export interface NavModel {
	wallet: NavItem[];
	explorer: NavItem[];
	global: NavItem[];
	tools: NavItem[];
}

export function buildNavModel(context: UnicoveContext, network: NetworkState): NavModel {
	const { urlPath } = context;

	const wallet: NavItem[] = [];
	if (context.account) {
		wallet.push({
			href: urlPath(`/account/${context.account.name}`),
			text: 'My Account',
			icon: UserIcon,
			bar: true
		});
	} else {
		wallet.push({ href: '', text: 'My Account', icon: UserIcon, signIn: true });
	}
	wallet.push({ href: urlPath('/send'), text: 'Send', icon: SendIcon, bar: true });
	wallet.push({ href: urlPath('/swap'), text: 'Swap', icon: ArrowLeftRightIcon });
	if (network.supports('staking')) {
		wallet.push({ href: urlPath('/staking'), text: 'Staking', icon: LayersIcon });
	}
	if (network.supports('rammarket')) {
		wallet.push({ href: urlPath('/ram'), text: 'RAM', icon: MemoryStickIcon });
	}
	wallet.push({ href: urlPath('/resources'), text: 'Resources', icon: ZapIcon });
	wallet.push({ href: urlPath('/tools'), text: 'Tools', icon: WrenchIcon, bar: true });

	const explorer: NavItem[] = [
		{ href: urlPath('/network'), text: 'Network', icon: GlobeIcon },
		{
			href: urlPath('/governance'),
			text: 'Governance',
			icon: LandmarkIcon,
			match: [urlPath('/producers'), urlPath('/sentiment'), urlPath('/proposals')]
		},
		{ href: urlPath('/token'), text: 'Tokens', icon: CoinsIcon }
	];
	if (network.supports('statindex')) {
		explorer.push({ href: urlPath('/contract'), text: 'Contracts', icon: FileCodeIcon });
		explorer.push({ href: urlPath('/account'), text: 'Accounts', icon: UsersIcon });
	}

	const global: NavItem[] = [{ href: urlPath('/settings'), text: 'Settings', icon: SettingsIcon }];
	if (context.settings.data.debugMode) {
		global.push({ href: urlPath('/debug/state'), text: 'Debug State' });
	}

	const tools: NavItem[] = [];
	if (network.supports('bidname')) {
		tools.push({
			href: urlPath('/bidname'),
			text: 'Name Bids',
			description: 'Bid on premium account names'
		});
	}
	if (network.supports('directfunding')) {
		tools.push({
			href: urlPath('/fund'),
			text: 'Add Funds',
			description: 'Buy tokens with a card or exchange'
		});
	}
	tools.push(
		{
			href: urlPath('/upload'),
			text: 'Deploy Contract',
			description: 'Upload contract code and ABI to an account'
		},
		{
			href: urlPath('/create-account'),
			text: 'Create Account',
			description: 'Choose how to create a new account on this network'
		}
	);

	return { wallet, explorer, global, tools };
}
