<script lang="ts">
	import { getContext } from 'svelte';

	import { Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import ActionCard from '$lib/components/elements/action.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';

	import { ApprovalManager } from '../manager.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import { getActionSummaryComponent } from '$lib/components/summary';
	import { POLL_CONTEXT, type SentimentPollBox } from '$lib/state/sentiment/poll.svelte';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const pollBox = getContext<SentimentPollBox>(POLL_CONTEXT);
	const manager = $state(new ApprovalManager(context, data.proposal, pollBox));

	$effect(() => {
		manager.sync(data.network, context.wharf);
	});

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

<Stack>
	<Stack>
		<h2 class="text-title">Proposed Actions ({data.proposal.transaction.actions.length})</h2>
		<SelectActionVariant />
		{#if manager.readable.length === 0}
			{#each data.proposal.transaction.actions as action (action)}
				<div class="bg-surface-container h-24 animate-pulse rounded-xl"></div>
			{/each}
		{/if}
		{#each manager.readable as decodedAction}
			{@const contract = String(decodedAction.action.account)}
			{@const action = String(decodedAction.action.name)}
			{@const summary = getActionSummaryComponent(contract, action, decodedAction.action.data)}
			<ActionCard
				action={decodedAction.action}
				objectified={decodedAction.readable?.data}
				{summary}
				{variant}
			/>
		{/each}
	</Stack>
</Stack>
