<script lang="ts">
	import { Card, Stack } from '@wharfkit/svelte-components';
	import type { TopicWithStats } from '$lib/types/sentiment';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { cn } from '$lib/utils';
	import SentimentMeter from './SentimentMeter.svelte';

	interface Props {
		topicData: TopicWithStats;
		class?: string;
	}

	const { topicData, ...props }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;
</script>

<a href={urlPath(`/sentiment/topics/${topicData.topic.id}`)} class="block">
	<Card class={cn('hover:bg-surface-container', props.class)}>
		<Stack>
			<header class="flex items-start justify-between gap-4">
				<div class="space-y-2 text-left">
					<h3 class="text-on-surface text-title">{topicData.topic.id}</h3>
					<p class="text-on-surface-variant text-label-sm">
						{new Date(topicData.topic.lastUpdated).toLocaleDateString()}
					</p>
				</div>
				<div class="space-y-2 text-right">
					<div class="text-on-surface text-label">
						<AssetText variant="short" value={topicData.statistics.totalWeightAsset} />
					</div>
					<p class="text-on-surface-variant text-label-sm">
						{topicData.statistics.totalVotes}
						{topicData.statistics.totalVotes === 1 ? 'vote' : 'votes'}
					</p>
				</div>
			</header>

			{#if topicData.statistics.totalVotes > 0}
				<SentimentMeter id={topicData.topic.id} statistics={topicData.statistics} />
			{/if}
		</Stack>
	</Card>
</a>
