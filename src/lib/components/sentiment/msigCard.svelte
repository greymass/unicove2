<script lang="ts">
	import { Card } from '@wharfkit/svelte-components';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { MsigWithStats } from '$lib/types/sentiment';
	import SentimentMeter from './SentimentMeter.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';

	interface Props {
		msigData: MsigWithStats;
	}

	const { msigData }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const msigUrl = $derived(
		context.urlPath(`/msig/${msigData.msig.proposer}/${msigData.msig.proposalName}`)
	);
</script>

<Card>
	<a
		href={msigUrl}
		class="group/card hover:bg-surface-container/50 block space-y-4 rounded-lg p-6 transition-colors"
	>
		<div class="flex items-start justify-between gap-4">
			<div class="min-w-0 flex-1 space-y-1">
				<h3
					class="text-headline-sm text-on-surface group-hover/card:text-primary truncate transition-colors"
				>
					{msigData.msig.proposalName}
				</h3>
				<p class="text-body-sm text-on-surface-variant">
					by <span class="font-mono">{msigData.msig.proposer}</span>
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<SentimentMeter
				id={`msig-${msigData.msig.proposer}-${msigData.msig.proposalName}`}
				statistics={msigData.statistics}
			/>

			<div class="text-label-sm text-on-surface-variant flex items-center justify-between">
				<span>{msigData.statistics.totalVotes} votes</span>
				<span>
					<AssetText variant="short" value={msigData.statistics.totalWeightAsset} />
				</span>
			</div>
		</div>
	</a>
</Card>
