<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { page } from '$app/stores';
	import Pageheader from '$lib/components/pageheader.svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import { goto } from '$app/navigation';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	// When an account changes, redirect any account-based URL (/send, /ram, etc) to
	// the network matching the account.
	$effect(() => {
		if (context.account && !context.account.network.chain.equals(data.network.chain)) {
			goto($page.url.pathname.replace(`/${data.network}/`, `/${context.account.network}/`));
		}
	});
</script>

<!-- Note: to enable subgrid on child pages this will need to change to `grid grid-cols-subgrid` -->
<Stack tag="article" class="@container gap-6">
	<Pageheader
		network={data.network}
		title={$page.data.title}
		subtitle={$page.data.subtitle}
		backPath={$page.data.backPath}
	/>

	{@render children?.()}
</Stack>
