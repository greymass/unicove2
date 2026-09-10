<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Card, Stack } from '@wharfkit/svelte-components';

	import ProposalCard from './components/ProposalCard.svelte';
	import StatusFilter from './components/StatusFilter.svelte';
	import EmptyState from './components/EmptyState.svelte';
	import ProposalsHeader from './components/ProposalsHeader.svelte';
	import Link from '$lib/components/elements/link.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	// Accumulate proposals data for infinite scroll
	let allProposals = $state(data.proposals);
	let currentOffset = $state(data.offset);
	let hasMore = $state(data.more);
	let isLoading = $state(false);

	const currentStatus = $derived(data.status);
	const accountName = $derived(String(data.name));

	// Fallback proposals from account object
	const fallbackProposals = $derived(data.account?.proposals || []);

	// Reset accumulated data when filters change
	$effect(() => {
		allProposals = data.proposals;
		currentOffset = data.offset;
		hasMore = data.more;
	});

	function handleStatusChange(status: string) {
		const url = new URL(page.url);
		if (status === 'proposed') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', status);
		}
		url.searchParams.delete('offset'); // Reset to first page
		goto(url.toString(), { replaceState: true });
	}

	async function loadMore() {
		if (isLoading) return;

		isLoading = true;
		try {
			const newOffset = currentOffset + (data.limit || 20);
			const response = await context.network.msigs.get_proposals(data.name, {
				status: currentStatus === 'all' ? undefined : currentStatus,
				limit: data.limit || 20,
				offset: newOffset
			});

			// Append new proposals to existing data
			allProposals = [...allProposals, ...response.proposals];
			currentOffset = newOffset;
			hasMore = response.more;
		} catch (error) {
			console.error('Error loading more proposals:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

{#if data.network.supports('msigapi')}
	<Stack>
		<ProposalsHeader {accountName}>
			<StatusFilter value={currentStatus} onchange={handleStatusChange} />
		</ProposalsHeader>

		{#if data.error}
			<div class="text-error">Failed to load proposals: {data.error}</div>
		{:else if allProposals.length === 0}
			<EmptyState
				title="No proposals found"
				message={currentStatus === 'all'
					? "This account hasn't created any multisig proposals yet"
					: `No ${currentStatus} proposals found`}
			/>
		{:else}
			<div class="grid gap-4">
				{#each allProposals as proposal, index (`${proposal.proposer}-${proposal.proposal_name}-${index}`)}
					<ProposalCard {proposal} />
				{/each}
			</div>

			{#if hasMore}
				<Button
					onclick={loadMore}
					variant="secondary"
					class="place-self-center"
					disabled={isLoading}
				>
					{isLoading ? 'Loading...' : 'Load More'}
				</Button>
			{/if}

			<p class="text-muted text-label-sm text-center">
				Showing {allProposals.length} of {data.total} total proposals
			</p>
		{/if}
	</Stack>
{:else}
	<Stack>
		<!-- <ProposalsHeader {accountName} /> -->

		{#each fallbackProposals as proposal}
			<Card titleTag="span" title="Proposal ID">
				<h2>
					<Link href={urlPath(`/msig/${data.name}/${proposal.proposal_name}`)}>
						{proposal.proposal_name}
					</Link>
				</h2>
			</Card>
		{:else}
			<Card>
				<p>No proposals found.</p>
			</Card>
		{/each}
	</Stack>
{/if}
