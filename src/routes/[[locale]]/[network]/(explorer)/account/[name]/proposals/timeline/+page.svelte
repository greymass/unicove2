<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Stack } from '@wharfkit/svelte-components';

	import ActivityEvent from '../components/ActivityEvent.svelte';
	import ActionTypeFilter from '../components/ActionTypeFilter.svelte';
	import EmptyState from '../components/EmptyState.svelte';
	import ProposalsHeader from '../components/ProposalsHeader.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	// Accumulate activity data for infinite scroll
	let allActivity = $state(data.activity);
	let currentOffset = $state(data.offset);
	let hasMore = $state(data.more);
	let isLoading = $state(false);

	const currentActionType = $derived(data.actionType);
	const accountName = $derived(String(data.name));

	// Reset accumulated data when filters change
	$effect(() => {
		// Watch for changes in the initial data (happens when action_type filter changes)
		allActivity = data.activity;
		currentOffset = data.offset;
		hasMore = data.more;
	});

	function handleActionTypeChange(actionType: string) {
		const url = new URL(page.url);
		if (actionType === 'all') {
			url.searchParams.delete('action_type');
		} else {
			url.searchParams.set('action_type', actionType);
		}
		url.searchParams.delete('offset');
		goto(url.toString(), { replaceState: true });
	}

	async function loadMore() {
		if (isLoading) return;

		isLoading = true;
		try {
			const newOffset = currentOffset + (data.limit || 20);
			const response = await context.network.msigs.get_activity(data.name, {
				action_type: currentActionType === 'all' ? undefined : currentActionType,
				limit: data.limit || 20,
				offset: newOffset
			});

			// Append new activity to existing data
			allActivity = [...allActivity, ...response.activity];
			currentOffset = newOffset;
			hasMore = response.more;
		} catch (error) {
			console.error('Error loading more activity:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<Stack>
	<ProposalsHeader {accountName}>
		<ActionTypeFilter value={currentActionType} onchange={handleActionTypeChange} />
	</ProposalsHeader>

	{#if data.error}
		<div class="text-error">Failed to load activity: {data.error}</div>
	{:else if allActivity.length === 0}
		<EmptyState
			title="No activity found"
			message={currentActionType === 'all'
				? 'This account has no multisig activity yet'
				: `No ${currentActionType} actions found`}
		/>
	{:else}
		<div class="grid gap-4">
			{#each allActivity as event, index (`${event.trx_id}-${event.globalseq}-${index}`)}
				<ActivityEvent {event} />
			{/each}
		</div>

		{#if hasMore}
			<Button onclick={loadMore} variant="secondary" class="place-self-center" disabled={isLoading}>
				{isLoading ? 'Loading...' : 'Load More'}
			</Button>
		{/if}

		<p class="text-muted text-label-sm text-center">
			Showing {allActivity.length} of {data.total} total events
		</p>
	{/if}
</Stack>
