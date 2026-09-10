<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import { Card, Button, Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { POLL_CONTEXT, type SentimentPollBox } from '$lib/state/sentiment/poll.svelte';
	import { serializeStatistics } from '$lib/state/sentiment/poll';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import { formatDescription } from '$lib/utils/strings';
	import MetricOverviewCard from '$lib/components/sentiment/MetricOverviewCard.svelte';
	import MetricLensDetail from '$lib/components/sentiment/MetricLensDetail.svelte';
	import MetricParticipants from '$lib/components/sentiment/MetricParticipants.svelte';
	import DiscussionCard from '$lib/components/discussion/DiscussionCard.svelte';
	import type { MetricLens } from '$lib/types/sentiment';

	const context = getContext<UnicoveContext>('state');
	const pollBox = getContext<SentimentPollBox>(POLL_CONTEXT);
	const { data } = $props();

	const poll = $derived(pollBox.current);
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);
	const statistics = $derived(
		poll?.displayed ?? serializeStatistics(data.topic.statistics, systemSymbol)
	);

	let activeLens = $state<MetricLens>('system');
	const lensLabels: Record<MetricLens, string> = $derived({
		system: String(systemSymbol.name),
		ram: 'RAM',
		v: 'V'
	});

	function selectLens(lens: MetricLens) {
		activeLens = lens;
		data.sentiment.loadTopicVotes(data.topicId, 1, 50, lens);
	}

	$effect(() => {
		const version = poll?.version ?? 0;
		if (version < 2 || poll?.expected) return;
		untrack(() => data.sentiment.loadTopicVotes(data.topicId, 1, 50, activeLens));
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

		{#if data.topic.topic}
			{@const topic = data.topic.topic}

			<div class="grid gap-6 @4xl:grid-cols-3">
				<Stack class="gap-3 @4xl:col-span-2">
					<h2 class="text-on-surface text-headline">Description</h2>
					<Card class="text-on-surface h-full whitespace-pre-wrap">
						{#if topic.description}
							{formatDescription(topic.description)}
						{/if}
					</Card>
				</Stack>

				<Stack class="gap-3">
					<h2 class="text-on-surface text-headline">Your Vote</h2>
					<Card>
						{#if poll}
							<VoteButtons {poll} />
						{/if}
					</Card>
				</Stack>
			</div>

			{#if statistics}
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
					<MetricLensDetail
						lens={activeLens}
						stats={statistics.metrics[activeLens]}
						{systemSymbol}
					/>
				</Stack>
			{/if}

			{#if data.sentiment.currentVotes.length > 0 && statistics}
				<MetricParticipants
					votes={data.sentiment.currentVotes}
					lens={activeLens}
					totalVotes={statistics.totalVotes}
					supportVotes={statistics.supportVotes}
					oppositionVotes={statistics.oppositionVotes}
					{systemSymbol}
				/>
			{/if}

			{#if context.network.supports('discussion')}
				<DiscussionCard
					tuples={[['topic', String(context.network.contracts.sentiment.account), data.topicId]]}
					href={context.urlPath(`/sentiment/topics/${data.topicId}/discussion`)}
				/>
			{/if}
		{:else}
			<Card>
				<p class="text-on-surface-variant text-center">Loading topic...</p>
			</Card>
		{/if}
	</Stack>
</article>
