<script lang="ts">
	import Hero from './components/hero.svelte';
	import StakingRewards from './components/staking-rewards.svelte';
	import SentimentShowcase from './components/sentiment-showcase.svelte';
	import Charts from './components/charts.svelte';
	import PerformanceGrid from './components/performance-grid.svelte';
	import Launcher from './components/launcher.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { jsonLd, appSchema } from '$lib/seo/schema';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const { network } = context;

	let networkLogo = $derived(String(data.network.config.logo));
	let networkName = $derived(String(data.network.config.name));
	let networkShortname = $derived(String(data.network));
</script>

<svelte:head>
	<!-- @wc-ignore -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLd(appSchema(String(page.url), data.network.chain.name))}
</svelte:head>

<div id="homepage" class="mb-4 grid content-start items-start gap-y-12 sm:gap-y-32 md:pt-0">
	<Hero {networkName} {networkShortname} />

	<Launcher />

	{#if network.supports('sentiment') && data.sentimentTopics?.length > 0}
		<SentimentShowcase topics={data.sentimentTopics} />
	{/if}

	{#if network.supports('staking')}
		<StakingRewards network={data.network} />
	{/if}

	<Charts />

	<PerformanceGrid {networkLogo} {networkName} network={data.network} />
</div>
