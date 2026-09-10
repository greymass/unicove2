<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';

	const context = getContext<UnicoveContext>('state');
</script>

<Stack>
	<h2 class="text-headline">Chain Configuration State (Client)</h2>
	<p>The chain configuration as it exists in the client.</p>
	{#if PUBLIC_ENVIRONMENT !== 'production'}
		<p>
			<Button href={context.urlPath(`/api/config`)}>Open SSR chain configuration</Button>
		</p>
	{/if}
	<Code>
		{JSON.stringify(context.network.config, null, 2)}
	</Code>
</Stack>
