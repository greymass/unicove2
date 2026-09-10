<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { Checksum256 } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');

	let transactionId: Checksum256 | undefined = $state();
	let error: string | undefined = $state();
	let transacting = $derived(context.wharf.transacting);

	async function transfer() {
		error = undefined;
		transactionId = undefined;

		if (!context.wharf.session) return;

		const symbol = context.network.chain.systemToken!.symbol;
		const quantity = Asset.fromUnits(1, symbol);

		try {
			const result = await context.wharf.transact({
				action: context.network.contracts.token.action('transfer', {
					from: context.wharf.session.actor,
					to: 'gm',
					quantity,
					memo: 'debug test'
				})
			});
			transactionId = result?.resolved?.transaction.id;
		} catch (e) {
			error = String(e);
			console.error(e);
		}
	}
</script>

<Stack class="items-start">
	<h2 class="text-headline">Debug Transact</h2>
	<p>
		Send {context.network.chain.systemToken?.symbol.name} 0.0001 to the <code>gm</code> account.
	</p>

	{#if context.wharf.session}
		<p>Logged in as: {context.wharf.session.actor}</p>
		<Button onclick={transfer} disabled={transacting} variant="primary">
			{transacting ? 'Transacting...' : 'Send Transfer'}
		</Button>
	{:else}
		<p>No session active.</p>
		<Button onclick={() => context.wharf.login()} variant="secondary">Login</Button>
	{/if}

	{#if transactionId}
		<h3 class="text-headline">Transaction ID</h3>
		<Code>{String(transactionId)}</Code>
	{/if}

	{#if error}
		<h3 class="text-headline">Error</h3>
		<Code>{error}</Code>
	{/if}
</Stack>
