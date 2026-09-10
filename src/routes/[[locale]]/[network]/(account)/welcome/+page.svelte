<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Stack } from '@wharfkit/svelte-components';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<Stack class="gap-6 md:mx-auto md:max-w-md">
	{#if context.account}
		<p>
			You're signed in as <span class="text-on-surface font-semibold">
				{context.account.name}
			</span>. Your account works across every app on the {context.network.chain.name} network — use
			it to hold tokens, sign transactions, and explore.
		</p>
		<div class="flex flex-wrap gap-4">
			<Button variant="primary" href={context.urlPath(`/account/${context.account.name}`)}>
				Go to my account
			</Button>
			<Button variant="secondary" href={context.urlPath('/')}>Explore Unicove</Button>
		</div>
	{:else}
		<p>Sign in with your new account to get started.</p>
		<div>
			<Button variant="primary" href={context.urlPath('/')}>Back to Unicove</Button>
		</div>
	{/if}
</Stack>
