<script lang="ts">
	import { type NameType } from '@wharfkit/antelope';
	import { ChainDefinition } from '@wharfkit/common';
	import { onMount, setContext, untrack } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import extend from 'just-extend';

	import {
		PUBLIC_ACCOUNT_UPDATE_INTERVAL,
		PUBLIC_NETWORK_UPDATE_INTERVAL,
		PUBLIC_MARKET_UPDATE_INTERVAL
	} from '$env/static/public';
	import { page } from '$app/state';

	import { AccountState } from '$lib/state/client/account.svelte.js';
	import { AccountValueState, NetworkValueState } from '$lib/state/value.svelte.js';
	import { MarketState } from '$lib/state/market.svelte.js';
	import { ProducersState } from '$lib/state/producers.svelte.js';
	import { SearchRecordStorage } from '$lib/state/search';
	import { reconcileLocale } from '$lib/state/locale.svelte.js';
	import { SettingsState } from '$lib/state/settings.svelte.js';
	import { WharfState } from '$lib/state/client/wharf.svelte.js';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';

	import ProposalNameDialog from '$lib/components/elements/proposalname.svelte';
	import NavShell from '$lib/components/navigation/shell.svelte';
	import type { NetworkState } from '$lib/state/network.svelte.js';
	import { MetaMaskState } from '$lib/state/metamask.svelte.js';
	import { checkForSnap } from '$lib/metamask-snap.js';
	import { checkIsFlask, getSnapsProvider } from '@wharfkit/wallet-plugin-metamask';
	import { DEFAULT_LOCALE, LOCALES } from '$lib/constants/locales.js';
	import { localizePath, localizeUrl } from '$lib/utils/url';
	import { jsonLd, siteSchema } from '$lib/seo/schema';

	let { children, data } = $props();

	const history = new SearchRecordStorage(data.network);
	const producers = new ProducersState(data.network);
	const settings = new SettingsState();
	const wharf = new WharfState(settings, producers);

	reconcileLocale(settings);
	const initialMarketValue = new MarketState(data.network, settings);
	let metaMaskState = new MetaMaskState();
	const initialNetworkValue = new NetworkValueState({
		network: data.network,
		market: initialMarketValue,
		settings: settings
	});

	let chain: ChainDefinition | undefined = $state();
	let market = $state(initialMarketValue);
	let networkValue = $state(initialNetworkValue);

	let account: AccountState | undefined = $state();
	let accountValue: AccountValueState | undefined = $state();

	const url = (url: string) => {
		return localizeUrl(url, { defaultLocale: data.locale });
	};

	const urlPath = (path: string) => {
		return localizePath(path, { defaultLocale: data.locale });
	};

	setContext<UnicoveContext>('state', {
		get account() {
			return account;
		},
		get history() {
			return history;
		},
		get metamask() {
			return metaMaskState;
		},
		get network() {
			return data.network;
		},
		get producers() {
			return producers;
		},
		get settings() {
			return settings;
		},
		url,
		urlPath,
		get wharf() {
			return wharf;
		}
	});
	setContext<MarketContext>('market', {
		get account() {
			return accountValue;
		},
		get market() {
			return market;
		},
		get network() {
			return networkValue;
		}
	});

	export function setAccount(name: NameType, fetchOverride?: typeof fetch): AccountState {
		account = new AccountState(data.network, name, fetchOverride);
		account.refresh();
		if (!data.network.chain.id.equals(account.network.chain.id)) {
			setMarket(data.network);
			setMarketNetwork(data.network);
		}
		setMarketAccount(data.network, account);
		return account;
	}

	async function setMarket(network: NetworkState) {
		market = new MarketState(network, settings);
		market.refresh();
	}

	function setMarketNetwork(network: NetworkState) {
		networkValue = new NetworkValueState({
			network,
			market,
			settings
		});
	}

	function setMarketAccount(network: NetworkState, account: AccountState) {
		accountValue = new AccountValueState({
			account,
			network,
			market,
			settings
		});
	}

	$effect(() => {
		const { session } = wharf;
		untrack(() => {
			if (session) {
				setAccount(session.actor);
			} else {
				account = undefined;
				accountValue = undefined;
			}
		});
	});

	async function setupWharf() {
		if (!wharf.sessionKit) {
			wharf.init(data.network);
		}

		await wharf.restore();
	}

	$effect(() => {
		const { network } = data; // Destructure to force reactivity
		untrack(() => {
			if (chain && !network.chain.equals(chain)) {
				// Set new chain
				chain = network.chain;

				// Set Wharf for new chain
				setupWharf();

				// Set markets for new chain
				setMarket(data.network);
				setMarketNetwork(data.network);
			}
		});
	});

	$effect(() => {
		if (metaMaskState.isMetaMaskReady && metaMaskState.snapProvider !== null) {
			metaMaskState.snapOrigin = data.network.snapOrigin;
			checkIsFlask(metaMaskState.snapProvider).then((isFlask) => {
				metaMaskState.isFlask = isFlask;
				checkForSnap(metaMaskState).then((isInstalled) => {
					metaMaskState.isInstalled = isInstalled;
				});
			});
		}
	});

	// Number of ms between network updates
	const ACCOUNT_UPDATE_INTERVAL = Number(PUBLIC_ACCOUNT_UPDATE_INTERVAL);
	const NETWORK_UPDATE_INTERVAL = Number(PUBLIC_NETWORK_UPDATE_INTERVAL);
	const MARKET_UPDATE_INTERVAL = Number(PUBLIC_MARKET_UPDATE_INTERVAL);

	onMount(() => {
		// Set the chain to the current network chain
		chain = data.network.chain;

		// Update account state on a set interval
		const accountInterval = setInterval(() => {
			if (account) {
				account.refresh();
			}
		}, ACCOUNT_UPDATE_INTERVAL);

		// Update the network state on a set interval
		const networkInterval = setInterval(() => {
			data.network.refresh();
		}, NETWORK_UPDATE_INTERVAL);

		// Update the market state on a set interval
		const marketInterval = setInterval(() => {
			market.refresh();
		}, MARKET_UPDATE_INTERVAL);

		// Enable Wharf
		setupWharf();

		// Load markets based off chain
		setMarket(data.network);
		setMarketNetwork(data.network);

		// Load producers
		producers.loadProducers();

		// Set the MetaMask snap provider on state
		getSnapsProvider().then((provider) => {
			metaMaskState.snapProvider = provider;
		});

		return () => {
			clearInterval(accountInterval);
			clearInterval(networkInterval);
			clearInterval(marketInterval);
		};
	});

	const seo_config = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, page.data?.pageMetaTags) as SeoConfig
	);
</script>

<Head {seo_config} />

<svelte:head>
	<!-- @wc-ignore -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLd(siteSchema(page.url.origin, data.network.chain.name))}

	<!-- Preload current chain logo -->
	<link rel="preload" href={String(data.network.config.logo)} as="image" type="image/png" />

	<!-- Canonical links for locales -->
	<link
		rel="alternate"
		href={localizeUrl(String(page.url), { forceLocale: DEFAULT_LOCALE })}
		hreflang="x-default"
	/>
	{#each LOCALES as locale}
		<link
			rel="alternate"
			hreflang={locale}
			href={localizeUrl(String(page.url), { forceLocale: locale })}
		/>
	{/each}

	<!-- Init color scheme on page load (unsure why this breaks in wuchale) -->
	<!-- @wc-ignore -->
	<script>
		(function () {
			if (typeof window !== undefined) {
				const storedTheme = localStorage.getItem('color-scheme');
				const theme =
					storedTheme ||
					(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
				document.documentElement.setAttribute('data-scheme', theme);
				if (!storedTheme) localStorage.setItem('color-scheme', theme);
			}
		})();
	</script>
</svelte:head>

<NavShell network={data.network}>{@render children?.()}</NavShell>

<ProposalNameDialog />
