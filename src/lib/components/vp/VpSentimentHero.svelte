<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import VpSentimentLens from '$lib/components/vp/VpSentimentLens.svelte';
	import { mountSentimentPoll } from '$lib/state/sentiment/poll.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { percentString } from '$lib/utils';
	import { formatNumber } from '$lib/utils/intl';
	import type { VpLens, VpProposalTopicRow } from '$lib/vp/sentiment';

	interface Props {
		row: VpProposalTopicRow;
		question: string;
		basePath: string;
	}

	const { row, question, basePath }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);

	const pollBox = mountSentimentPoll(context, () => ({ kind: 'topic', id: row.topic }));
	const poll = $derived(pollBox.current);
	const statistics = $derived(poll?.displayed ?? null);
	let lens = $state<VpLens>('system');

	const participantsPath = $derived(`${basePath}/sentiment/${row.topic}/participants`);
	const showParticipants = $derived(
		context.network.supports('sentiment') && (statistics?.totalVotes ?? 0) > 0
	);

	const lensStats = $derived.by(() => {
		if (!statistics) return null;
		if (lens === 'accounts') {
			const total = statistics.totalVotes;
			if (!total) return { supportPercentage: 0, oppositionPercentage: 0 };
			return {
				supportPercentage: (statistics.supportVotes / total) * 100,
				oppositionPercentage: (statistics.oppositionVotes / total) * 100
			};
		}
		const metric = statistics.metrics[lens === 'vote' ? 'v' : lens];
		return {
			supportPercentage: metric.supportPercentage,
			oppositionPercentage: metric.oppositionPercentage
		};
	});
</script>

<Card>
	<h2 class="text-title">{question}</h2>

	{#if statistics && lensStats}
		<div class="mt-4 flex flex-wrap items-end justify-between gap-4">
			<div>
				<span class="text-display text-success">
					{percentString(locale, lensStats.supportPercentage / 100, 0)}
				</span>
				<p class="text-muted mt-1 text-sm">
					{#if lens === 'accounts'}
						support by account
					{:else if lens === 'ram'}
						support by RAM weight
					{:else if lens === 'vote'}
						support by V weight
					{:else}
						support by {systemSymbol.name} weight
					{/if}
					·
					{#snippet voteCount()}
						{#if statistics.totalVotes === 1}
							1 vote
						{:else}
							{statistics.totalVotes} votes
						{/if}
					{/snippet}
					{#if showParticipants}
						<a class="hover:text-primary underline underline-offset-2" href={participantsPath}>
							{@render voteCount()}
						</a>
					{:else}
						{@render voteCount()}
					{/if}
				</p>
				{#if lens !== 'accounts'}
					<p class="text-muted mt-1 text-sm">
						{#if lens === 'ram'}
							{formatBytes(statistics.metrics.ram.total)}
						{:else if lens === 'vote'}
							{formatNumber(statistics.metrics.v.total, locale, {
								notation: 'compact',
								maximumFractionDigits: 2
							})} V
						{:else}
							<AssetText
								variant="short"
								value={Asset.fromUnits(statistics.metrics.system.total, systemSymbol)}
							/>
						{/if}
					</p>
				{/if}
			</div>
			<VpSentimentLens selected={lens} onselect={(next) => (lens = next)} />
		</div>

		<div class="mt-4">
			<SentimentMeter id="vp-hero-{row.topic}" statistics={lensStats} />
		</div>
	{:else}
		<div class="mt-4 grid animate-pulse gap-3" role="status" aria-busy="true">
			<span class="sr-only">Loading sentiment</span>
			<div class="bg-surface-container h-10 w-32 rounded"></div>
			<div class="bg-surface-container h-7 rounded"></div>
		</div>
	{/if}

	<div class="mt-4">
		{#if poll}
			<VoteButtons {poll} />
		{/if}
	</div>

	{#if showParticipants || context.network.supports('discussion')}
		<div class="border-outline mt-4 flex flex-wrap gap-x-2 gap-y-1 border-t pt-3">
			{#if showParticipants}
				<a class="text-primary text-sm font-medium hover:underline" href={participantsPath}>
					See who voted
				</a>
			{/if}
			{#if showParticipants && context.network.supports('discussion')}
				<span class="text-muted text-sm" aria-hidden="true">·</span>
			{/if}
			{#if context.network.supports('discussion')}
				<a
					class="text-primary text-sm font-medium hover:underline"
					href="{basePath}/discussion?target=topic:{row.contract}:{row.topic}"
				>
					Read the discussion
				</a>
			{/if}
		</div>
	{/if}
</Card>
