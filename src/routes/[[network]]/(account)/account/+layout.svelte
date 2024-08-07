<script lang="ts">
	let { children } = $props();
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { getWharf } from '$lib/state/client/wharf.svelte';

	const wharf = getWharf();

	const tabOptions = [
		{ href: '/account', text: 'Overview' },
		{ href: '/account/resources', text: 'Resources' },
		{ href: '/account/activity', text: 'Activity' },
		{ href: '/account/chaindata', text: 'Chain Data' }
	];

	let currentTab = $derived($page.url.pathname.split('/').slice(2)[1]);

	// Derive the active state of each destination
	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/')[2] === currentTab
		}))
	);
</script>

<header class="flex flex-wrap justify-between gap-6 pt-2 pb-10">
	<Stack class="gap-1">
		<h1 class="h2 text-neutral-200/60">Account</h1>
		{#if wharf.session}
			<h2 class="h1 font-bold text-white">{wharf.session.actor}</h2>
		{/if}
	</Stack>

	<PillGroup {options} class="sm:self-end" />
</header>

{@render children()}
