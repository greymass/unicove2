<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { MetricLens, AssetMetricStats } from '$lib/types/sentiment';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { percentString } from '$lib/utils';
	import SentimentMeter from './SentimentMeter.svelte';

	interface Props {
		lens: MetricLens;
		label: string;
		stats: AssetMetricStats;
		selected: boolean;
		onselect: (lens: MetricLens) => void;
	}

	const { lens, label, stats, selected, onselect }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);
	const locale = $derived(context.settings.data.locale);
</script>

<button class="text-left" onclick={() => onselect(lens)}>
	<Card
		class="h-full transition-shadow {selected
			? 'ring-primary ring-2'
			: 'hover:ring-outline hover:ring-1'}"
	>
		<div class="grid gap-3">
			<div class="flex items-baseline justify-between gap-2">
				<h3 class="text-muted text-label-sm">{label}</h3>
				<span class="text-on-surface text-title">
					{#if lens === 'system'}
						<AssetText variant="short" value={Asset.fromUnits(stats.total, systemSymbol)} />
					{:else if lens === 'ram'}
						{formatBytes(stats.total)}
					{:else}
						{stats.total.toLocaleString()} V
					{/if}
				</span>
			</div>
			<SentimentMeter id="overview-{lens}" compact statistics={stats} />
			<div class="text-label-sm flex justify-between">
				<span class:text-success={stats.supportPercentage > 0}>
					{percentString(locale, stats.supportPercentage / 100, 0)}
				</span>
				<span class:text-error={stats.oppositionPercentage > 0}>
					{percentString(locale, stats.oppositionPercentage / 100, 0)}
				</span>
			</div>
		</div>
	</Card>
</button>
