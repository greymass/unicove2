<script lang="ts">
	import { Card } from '@wharfkit/svelte-components';
	import type { TopicStatistics } from '$lib/types/sentiment';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Weight from '@lucide/svelte/icons/scale';
	import SentimentMeter from './SentimentMeter.svelte';
	import { cn } from '$lib/utils';
	import StatCard from './StatCard.svelte';

	interface Props {
		statistics: TopicStatistics;
		loading?: boolean;
		class?: string;
	}

	const { statistics, loading = false, ...props }: Props = $props();
</script>

<div class={cn('relative grid gap-6', props.class)}>
	{#if loading}
		<div
			class="bg-surface/40 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg backdrop-blur-[2px]"
		>
			<svg class="text-primary size-12 animate-spin" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			<p class="text-on-surface text-sm font-medium">Updating Data</p>
		</div>
	{/if}

	<Card>
		<h3 class="text-muted text-label-sm mb-3">Vote Distribution</h3>
		<SentimentMeter id="vote-distribution" {statistics} />
	</Card>

	<div class="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
		<StatCard class="" label="Support Weight" icon={Weight} supports={true}>
			<AssetText variant="short" value={statistics.totalSupportWeightAsset} />
		</StatCard>

		<StatCard
			class="order-first col-span-full @4xl:order-none @4xl:col-span-1"
			label="Total Weight"
			icon={Weight}
		>
			<AssetText variant="short" value={statistics.totalWeightAsset} />
		</StatCard>

		<StatCard label="Opposition Weight" icon={Weight} supports={false}>
			<AssetText variant="short" value={statistics.totalOppositionWeightAsset} />
		</StatCard>
	</div>
</div>
