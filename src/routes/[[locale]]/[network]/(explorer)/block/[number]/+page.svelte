<script lang="ts">
	import { MultiCard } from '$lib/components/layout';
	import { Stack, Switcher, Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import TransactionText from '$lib/components/elements/transaction.svelte';
	import AccountText from '$lib/components/elements/account.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { ArrowLeftRight, ArrowRight, ArrowLeft } from '@lucide/svelte';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';
	import { goto } from '$app/navigation';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	let { data } = $props();
	const { urlPath } = getContext<UnicoveContext>('state');

	const previousBlockLink = $derived(urlPath(`/block/${Number(data.height) - 1}`));
	const nextBlockLink = $derived(urlPath(`/block/${Number(data.height) + 1}`));

	const handleKeydown = (e: KeyboardEvent) => {
		// Don't do anything if search is open
		if (
			document.activeElement?.tagName === 'INPUT' ||
			document.activeElement?.tagName === 'TEXTAREA' ||
			document.activeElement?.getAttribute('contenteditable') === 'true'
		) {
			return;
		}

		if (e.key === 'ArrowRight') {
			goto(nextBlockLink);
		} else if (e.key === 'ArrowLeft') {
			goto(previousBlockLink);
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<MultiCard>
	{#snippet leftColumn()}
		{#if data.block.transactions}
			{@const transactions = data.block.transactions}
			<Stack id="transactions">
				<h2 class="text-title flex items-center gap-2">
					<ArrowLeftRight class="size-5" />
					{transactions.length}
					{transactions.length === 1 ? 'Transaction' : 'Transactions'}
				</h2>

				{#if transactions.length}
					<Table>
						{#snippet thead()}
							<TH>Transaction</TH>
							<TH class="text-right">Actions</TH>
							<TH class="text-right">CPU (μs)</TH>
							<TH class="text-right">NET (Bytes)</TH>
						{/snippet}

						{#each transactions as transaction}
							{#if transaction}
								{@const txID =
									typeof transaction.trx === 'string' ? transaction.trx : transaction.trx.id}
								<TR>
									<TD><TransactionText id={txID} /></TD>
									<TD class="text-right">{transaction.trx.transaction?.actions.length || 0}</TD>
									<TD class="text-right">{transaction.cpu_usage_us}</TD>
									<TD class="text-right">{Number(transaction.net_usage_words) * 8}</TD>
								</TR>
							{/if}
						{/each}
					</Table>
				{:else}
					<p>No transactions</p>
				{/if}
			</Stack>
		{/if}
	{/snippet}

	{#snippet rightColumn()}
		<Stack class="gap-4" id="details">
			<h2 class="text-title">Block Details</h2>

			<DL>
				<DLRow title="Block Number">
					<DD>
						{data.details.blockNumber}
					</DD>
				</DLRow>
				<DLRow title="Producer Name">
					<DD>
						<AccountText name={data.details.blockProducer} />
					</DD>
				</DLRow>
				<DLRow title="Total CPU">
					<DD>
						{data.details.totalCpu} μs
					</DD>
				</DLRow>
				<DLRow title="Total NET">
					<DD>
						{data.details.totalNet * 8} Bytes
					</DD>
				</DLRow>
				<DLRow title="Total Actions">
					<DD>
						{data.details.totalActions}
					</DD>
				</DLRow>
				<DLRow title="Block ID">
					<DD>
						{data.details.blockId}
					</DD>
				</DLRow>
			</DL>

			<Switcher>
				{#if data.height > 1}
					<Button href={previousBlockLink} variant="secondary">
						<span class="inline-flex items-center gap-1">
							<ArrowLeft class="size-4" />
							Previous Block
						</span>
					</Button>
				{/if}
				<Button href={nextBlockLink} variant="secondary">
					<span class="inline-flex items-center gap-1">
						Next Block
						<ArrowRight class="size-4" />
					</span>
				</Button>
			</Switcher>
		</Stack>
	{/snippet}
</MultiCard>
