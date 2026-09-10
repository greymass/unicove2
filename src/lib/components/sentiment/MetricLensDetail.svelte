<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { Card } from '@wharfkit/svelte-components';
	import Weight from '@lucide/svelte/icons/scale';
	import type { MetricLens, AssetMetricStats } from '$lib/types/sentiment';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import StatCard from './StatCard.svelte';
	import SentimentMeter from './SentimentMeter.svelte';

	interface Props {
		lens: MetricLens;
		stats: AssetMetricStats;
		systemSymbol: Asset.Symbol;
	}

	const { lens, stats, systemSymbol }: Props = $props();

	const labels: Record<MetricLens, string> = $derived({
		system: String(systemSymbol.name),
		ram: 'RAM',
		v: 'V'
	});
</script>

{#snippet value(amount: number)}
	{#if lens === 'system'}
		<AssetText variant="short" value={Asset.fromUnits(amount, systemSymbol)} />
	{:else if lens === 'ram'}
		{formatBytes(amount)}
	{:else}
		{amount.toLocaleString()} V
	{/if}
{/snippet}

<Card>
	<h3 class="text-muted text-label-sm mb-3">{labels[lens]} Vote Distribution</h3>
	<SentimentMeter id="lens-detail-{lens}" statistics={stats} />
</Card>

<div class="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
	<StatCard label="Support {labels[lens]}" icon={Weight} supports={true}>
		{@render value(stats.support)}
	</StatCard>

	<StatCard
		class="order-first col-span-full @4xl:order-none @4xl:col-span-1"
		label="Total {labels[lens]}"
		icon={Weight}
	>
		{@render value(stats.total)}
	</StatCard>

	<StatCard label="Opposition {labels[lens]}" icon={Weight} supports={false}>
		{@render value(stats.opposition)}
	</StatCard>
</div>
