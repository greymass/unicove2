<script lang="ts">
	import { transactions } from '$lib/wharf/transact.svelte';
	import { Serializer, type Checksum256 } from '@wharfkit/antelope';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import ClipboardPen from '@lucide/svelte/icons/clipboard-pen';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { Types as MsigTypes } from '$lib/wharf/contracts/msig';
	import { Button } from '@wharfkit/svelte-components';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';

	const { urlPath } = getContext<UnicoveContext>('state');

	interface Props {
		transactionId?: Checksum256 | string;
		hidden?: boolean;
		onsuccess?: () => ReturnType<import('svelte').Snippet>;
	}

	const { transactionId, hidden, onsuccess }: Props = $props();

	const transaction = $derived(
		transactions.find((t) => t.transaction?.id.equals(String(transactionId)))
	);

	const proposals = $derived(
		transaction?.transaction?.actions
			.filter((a) => a.name.equals('propose') && a.account.equals('eosio.msig'))
			.map((p) => {
				return Serializer.decode({
					data: p.data,
					type: MsigTypes.propose
				});
			})
	);
</script>

<div class="space-y-6 rounded-lg" class:hidden>
	{#if transaction}
		<div class="flex flex-col items-center gap-6">
			{#if proposals && proposals.length}
				<picture class="size-24">
					<ClipboardPen class="text-success size-full" />
				</picture>
				<h3 class="text-title">Multi-Sig Proposal Created</h3>
				<p class="text-center">
					The multi-sig proposal for this transaction has been created and now needs to be approved.
					View the proposal below and share it with the parties who need to sign.
				</p>
				{#each proposals as proposal}
					<Button href={urlPath(`/msig/${proposal.proposer}/${proposal.proposal_name}`)}>
						View Proposal ({proposal.proposer}/{proposal.proposal_name})
					</Button>
				{/each}
			{:else}
				<picture class="size-24">
					<CircleCheckBig class="text-success size-full" />
				</picture>
				<h3 class="text-title text-center">Transaction Complete</h3>
			{/if}
		</div>

		<DL class="bg-surface-container rounded-xl p-4 font-mono">
			<DLRow title="Status">
				<DD>{transaction.status}</DD>
			</DLRow>
			{#if transaction.transaction}
				<DLRow title="Transaction ID">
					<DD><Transaction id={transaction.transaction.id} /></DD>
				</DLRow>
			{/if}
		</DL>
	{:else}
		<h2 class="text-headline">Transaction Not Found</h2>
		<p>The transaction with ID {String(transactionId)} could not be found.</p>
	{/if}
	{#if onsuccess}
		{@render onsuccess()}
	{/if}
</div>
