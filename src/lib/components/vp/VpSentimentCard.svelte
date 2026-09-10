<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import { percentString } from '$lib/utils';
	import type {
		TopicStatistics,
		ApiResponse,
		TopicDetailData,
		MsigDetailData
	} from '$lib/types/sentiment';
	import { vpMsigSteps } from '$lib/vp/onchain';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
		basePath: string;
	}

	const { summary, basePath }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const locale = $derived(context.settings.data.locale);
	const topic = $derived(summary.sentiment[0] ?? null);
	const liveStep = $derived(vpMsigSteps(summary, locale).find((s) => s.live) ?? null);
	const symbol = $derived(context.network.chain.systemToken?.symbol.name ?? null);
	const href = $derived(topic ? `${basePath}/sentiment` : `${basePath}/multisigs`);
	let statistics = $state<TopicStatistics | null>(null);
	let loaded = $state(false);

	$effect(() => {
		const controller = new AbortController();
		let url: string | null = null;
		if (topic) {
			url = context.urlPath(`/api/sentiment/topics/${topic.topic}`);
		} else if (liveStep?.proposer && liveStep?.proposal) {
			url = context.urlPath(`/api/sentiment/msigs/${liveStep.proposer}/${liveStep.proposal}`);
		}
		if (!url) {
			loaded = true;
			return;
		}
		fetch(url, { signal: controller.signal })
			.then((response) => response.json())
			.then((result: ApiResponse<TopicDetailData | MsigDetailData>) => {
				if (result.success && result.data) statistics = result.data.statistics;
				loaded = true;
			})
			.catch(() => {
				loaded = true;
			});
		return () => controller.abort();
	});
</script>

<Card class="hover:bg-surface-container p-0 transition-colors">
	<a {href} class="block p-4">
		<div class="flex items-baseline justify-between gap-2">
			<h2 class="text-label-sm text-muted">Sentiment</h2>
			{#if statistics}
				<span class="text-muted text-label-sm">
					{#if statistics.totalVotes === 1}
						1 vote
					{:else}
						{statistics.totalVotes} votes
					{/if}
				</span>
			{/if}
		</div>

		{#if !topic && liveStep}
			<p class="text-muted mt-1 text-sm">
				{#if liveStep.title}
					Step {liveStep.step}: {liveStep.title}
				{:else}
					Step {liveStep.step} of the enactment
				{/if}
			</p>
		{/if}

		{#if statistics && statistics.totalVotes > 0}
			<div class="mt-3 flex items-end justify-between gap-3">
				<div>
					<span class="text-headline text-success">
						{percentString(locale, statistics.supportPercentage / 100, 0)}
					</span>
					<p class="text-muted text-sm">support</p>
				</div>
				<div class="text-right">
					<span class="text-title text-error">
						{percentString(locale, statistics.oppositionPercentage / 100, 0)}
					</span>
					<p class="text-muted text-sm">oppose</p>
				</div>
			</div>
			<div class="mt-3">
				<SentimentMeter id="vp-card-{topic?.topic ?? liveStep?.proposal}" compact {statistics} />
			</div>
			{#if symbol}
				<p class="text-muted text-label-sm mt-2">Weighted by {symbol}</p>
			{/if}
		{:else if statistics}
			<p class="text-muted mt-3 text-sm">No votes have been cast on this poll.</p>
		{:else if loaded}
			<p class="text-muted mt-3 text-sm">Sentiment is recorded on-chain.</p>
		{:else}
			<div class="mt-3 animate-pulse">
				<div class="bg-surface-container h-4 w-24 rounded"></div>
			</div>
		{/if}

		<p class="text-primary border-outline mt-4 border-t pt-3 text-sm font-medium">
			{topic ? 'View sentiment' : 'View the multisigs'}
		</p>
	</a>
</Card>
