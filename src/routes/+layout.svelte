<script lang="ts">
	import '../app.css';
	import 'inter-ui/inter-latin.css';
	import extend from 'just-extend';
	import { onMount, untrack } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import Navigation from '$lib/components/navigation/appnavigation.svelte';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { getWharf } from '$lib/state/client/wharf.svelte';
	import { getAccount } from '$lib/state/client/account.svelte';

	let { children, data } = $props();
	const { network } = $derived(data);

	const account = getAccount();
	const wharf = getWharf();
	$effect(() => {
		const { session } = wharf;
		untrack(() => (session ? account.load(session.chain, session.actor) : account.clear()));
	});

	const seo_config: SeoConfig = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, $page.data.pageMetaTags)
	);

	// Number of ms between network updates
	const ACCOUNT_UPDATE_INTERVAL = 30_000;
	const NETWORK_UPDATE_INTERVAL = 30_000;

	onMount(() => {
		// Initialize Wharf and restore session state
		wharf.init();
		wharf.restore();

		// Refresh the account state
		if (wharf.session) {
			account.refresh();
		}

		// Update account state on a set interval
		const accountInterval = setInterval(() => {
			if (wharf.session) {
				account.refresh();
			}
		}, ACCOUNT_UPDATE_INTERVAL);

		// Update the network state on a set interval
		const networkInterval = setInterval(() => {
			if (network) {
				network.refresh();
			}
		}, NETWORK_UPDATE_INTERVAL);

		return () => {
			clearInterval(accountInterval);
			clearInterval(networkInterval);
		};
	});
</script>

<Head {seo_config} />

<Toaster />

<ParaglideJS {i18n}>
	<Navigation />
	{@render children()}
</ParaglideJS>
