<script lang="ts">
	import { page } from '$app/stores';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	let { children } = $props();

	const { urlPath } = getContext<UnicoveContext>('state');

	const activeItem = $derived($page.url.pathname.split('/').pop());
</script>

<AccountNavigation
	options={[
		{
			active: activeItem === 'account',
			href: urlPath(`/debug/state/account`),
			text: 'Account'
		},
		{
			active: activeItem === 'config',
			href: urlPath(`/debug/state/config`),
			text: 'Config'
		},
		{
			active: activeItem === 'contracts',
			href: urlPath(`/debug/state/contracts`),
			text: 'Contracts'
		},
		{
			active: activeItem === 'market',
			href: urlPath(`/debug/state/market`),
			text: 'Market'
		},
		{
			active: activeItem === 'network',
			href: urlPath(`/debug/state/network`),
			text: 'Network'
		},
		{ active: activeItem === 'wharf', href: urlPath(`/debug/state/wharf`), text: 'Wharf' }
	]}
/>

<div class="mt-8">
	{@render children?.()}
</div>
