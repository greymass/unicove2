<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { page } from '$app/state';

	import { Stack, Switcher } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { BidRefundManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: BidRefundManager = $state(new BidRefundManager(data.network));

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	onMount(() => {
		const name = page.url.searchParams.get('name');
		if (name) {
			manager.bidName = name;
			if (context.account) {
				manager.loadRefund();
			}
		}
	});

	$effect(() => {
		if (context.account && manager.bidName) {
			manager.loadRefund();
		}
	});

	function resetState() {
		manager = new BidRefundManager(data.network);
		const name = page.url.searchParams.get('name');
		if (name) {
			manager.bidName = name;
		}
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={context.urlPath(`/bidname`)} variant="secondary">Back to Premium Names</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Try Again</Button>
	{:else if !context.account}
		<p class="text-muted">Please log in to claim a refund.</p>
	{:else if manager.loading}
		<p class="text-muted">Loading refund information...</p>
	{:else}
		<Switcher>
			<Stack class="gap-4">
				<Stack class="gap-2">
					<h3 class="text-muted leading-none">Name</h3>
					<p class="text-on-surface text-2xl font-bold">{manager.bidName}</p>
				</Stack>
				{#if manager.hasRefund}
					<Stack class="gap-2">
						<h3 class="text-muted leading-none">Refund Available</h3>
						<p class="text-on-surface text-2xl font-bold">{String(manager.refundAmount)}</p>
					</Stack>
					<p class="text-muted text-sm">
						You were outbid on this name. Claim this refund to return {String(manager.refundAmount)}
						to your account. You can then use these tokens to place a new bid if you wish.
					</p>
				{:else}
					<p class="text-muted">No refund available for this name.</p>
				{/if}
			</Stack>
			{#if manager.hasRefund}
				<Button disabled={!manager.canRefund} onclick={() => manager.transact()} variant="primary">
					Claim Refund ({String(manager.refundAmount)})
				</Button>
			{/if}
			<Button href={context.urlPath(`/bidname`)} variant="secondary">Back to Premium Names</Button>
		</Switcher>
	{/if}
</Stack>
