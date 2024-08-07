<script lang="ts">
	let { children } = $props();
	import { PageMargin } from '$lib/components/layout';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';
	import { page } from '$app/stores';

	const destinations = [
		{ href: '/account', text: 'Account' },
		{ href: '/permissions', text: 'Permissions' },
		{ href: '/ram', text: 'RAM' },
		{ href: '/resources', text: 'Resources' },
		{ href: '/send', text: 'Send' },
		{ href: '/transfer', text: 'Transfer' },
		{ href: '/vote', text: 'Vote' },
		{ href: '/transactions', text: 'Transactions' }
	];

	let rootPathname = $derived($page.url.pathname.split('/').slice(2)[0]);

	// Derive the active state of each destination
	let options = $derived(
		destinations.map((destination) => ({
			...destination,
			active: destination.href.includes(rootPathname)
		}))
	);
</script>

<AccountNavigation {options} />

<PageMargin>
	{@render children()}
</PageMargin>
