<script lang="ts">
	import { Stack, Switcher } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { RefundManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: RefundManager = $state(new RefundManager(data.network));

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	function resetState() {
		manager = new RefundManager(data.network);
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Close</Button>
	{:else}
		<Switcher>
			<Stack class="gap-2">
				<h3 class="text-muted leading-none">Refunding</h3>
				<p class="text-on-surface text-2xl font-bold">{String(manager.refunding)}</p>
				{#if manager.dateAvailable}
					<h3 class="text-muted mt-8 leading-none">Date Available</h3>
					<p class="text-on-surface font-bold">{String(manager.dateAvailable?.toLocaleString())}</p>
				{/if}
			</Stack>

			<Button onclick={() => manager.transact()} variant="primary">Refund</Button>
		</Switcher>
	{/if}
</Stack>
