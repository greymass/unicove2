<script lang="ts">
	import { getContext, onMount, untrack } from 'svelte';
	import { Button, Card, Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import MetricOverviewCard from '$lib/components/sentiment/MetricOverviewCard.svelte';
	import MetricLensDetail from '$lib/components/sentiment/MetricLensDetail.svelte';
	import MetricParticipants from '$lib/components/sentiment/MetricParticipants.svelte';
	import DiscussionCard from '$lib/components/discussion/DiscussionCard.svelte';
	import { msigDescriptor } from '$lib/discussion/targets';
	import type { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';
	import { POLL_CONTEXT, type SentimentPollBox } from '$lib/state/sentiment/poll.svelte';
	import type { MetricLens } from '$lib/types/sentiment';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const sentimentState = getContext<MsigSentimentState>('msig-sentiment');
	const pollBox = getContext<SentimentPollBox>(POLL_CONTEXT);
	const poll = $derived(pollBox.current);
	const statistics = $derived(poll?.displayed ?? null);
	const descriptor = $derived(
		msigDescriptor(data.proposal.proposer, data.proposal.name, data.proposal.status)
	);

	let activeLens = $state<MetricLens>('system');
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);
	const lensLabels: Record<MetricLens, string> = $derived({
		system: String(systemSymbol.name),
		ram: 'RAM',
		v: 'V'
	});

	function selectLens(lens: MetricLens) {
		activeLens = lens;
		sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, lens);
	}

	onMount(() => {
		sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, activeLens);
	});

	$effect(() => {
		const version = poll?.version ?? 0;
		if (version < 2 || poll?.expected) return;
		untrack(() =>
			sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, activeLens)
		);
	});
</script>

<article class="@container">
	<Stack class="gap-8">
		{#if poll?.loadError}
			<div
				class="bg-error/10 text-error border-error/30 flex items-center justify-between gap-2 rounded border px-4 py-2 text-sm"
			>
				<span>{poll.loadError}</span>
				<Button variant="text" onclick={() => poll?.dismissError()} class="text-error">
					Dismiss
				</Button>
			</div>
		{/if}

		{#if statistics}
			{#if context.account}
				<Stack class="gap-3">
					<h2 class="text-on-surface text-headline">Your Vote</h2>
					<Card>
						{#if poll}
							<VoteButtons {poll} />
						{/if}
					</Card>
				</Stack>
			{/if}

			<Stack class="gap-3">
				<h2 class="text-on-surface text-headline">Statistics</h2>
				<div class="grid gap-6 @xl:grid-cols-3">
					{#each Object.keys(lensLabels) as lens (lens)}
						{@const key = lens as MetricLens}
						<MetricOverviewCard
							lens={key}
							label={lensLabels[key]}
							stats={statistics.metrics[key]}
							selected={activeLens === key}
							onselect={selectLens}
						/>
					{/each}
				</div>
				<MetricLensDetail lens={activeLens} stats={statistics.metrics[activeLens]} {systemSymbol} />
			</Stack>

			{#if sentimentState.currentVotes.length > 0}
				<MetricParticipants
					votes={sentimentState.currentVotes}
					lens={activeLens}
					totalVotes={statistics.totalVotes}
					supportVotes={statistics.supportVotes}
					oppositionVotes={statistics.oppositionVotes}
					{systemSymbol}
				/>
			{/if}

			{#if context.network.supports('discussion')}
				<DiscussionCard
					tuples={[descriptor.tuple]}
					href={context.urlPath(`/msig/${data.proposal.proposer}/${data.proposal.name}/discussion`)}
				/>
			{/if}
		{:else if poll?.loadError}
			<Card>
				<Stack class="items-start gap-2">
					<p class="text-on-surface-variant">Sentiment results could not be loaded.</p>
					<Button variant="secondary" onclick={() => poll?.refresh()}>Try Again</Button>
				</Stack>
			</Card>
		{:else}
			<Stack class="animate-pulse gap-3">
				<div class="bg-surface-container h-7 w-40 rounded"></div>
				<div class="grid gap-6 @xl:grid-cols-3">
					<div class="bg-surface-container h-32 rounded-xl"></div>
					<div class="bg-surface-container h-32 rounded-xl"></div>
					<div class="bg-surface-container h-32 rounded-xl"></div>
				</div>
				<div class="bg-surface-container h-24 rounded-xl"></div>
			</Stack>
		{/if}
	</Stack>
</article>
