<script lang="ts">
	import '../app.css';
	import 'inter-ui/inter-latin.css';
	import extend from 'just-extend';
	import { onMount } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { wharf } from '$lib/wharf/service.svelte.js';
	import Navigation from '$lib/components/navigation/appnavigation.svelte';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { network } from '$lib/state/network.svelte.js';

	let { children, data } = $props();

	const seo_config: SeoConfig = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, $page.data.pageMetaTags)
	);

	onMount(() => {
		// Initialize Wharf and restore session state
		wharf.init();
		wharf.restore();

		// Initialize network state
		network.init();
	});
</script>

<Head {seo_config} />

<Toaster />

<ParaglideJS {i18n}>
	<Navigation />
	{@render children()}
</ParaglideJS>
