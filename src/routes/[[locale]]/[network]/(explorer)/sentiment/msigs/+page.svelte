<script lang="ts">
	import { getContext } from 'svelte';
	import { Button, Card, Stack } from '@wharfkit/svelte-components';
	import MsigCard from '$lib/components/sentiment/msigCard.svelte';
	import MsigCardSkeleton from '$lib/components/sentiment/msigCardSkeleton.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const sortedMsigs = $derived(
		[...data.sentiment.msigs].sort((a, b) => b.statistics.totalWeight - a.statistics.totalWeight)
	);
</script>

<div class="xs:grid-cols-full grid items-start gap-6 lg:grid-cols-[70%_1fr]">
	<div class="space-y-6">
		{#if data.sentiment.loading}
			<div class="space-y-4">
				<MsigCardSkeleton />
				<MsigCardSkeleton />
				<MsigCardSkeleton />
			</div>
		{:else if data.sentiment.error}
			<Card title="Failed to load multisig sentiment">
				<p class="text-on-error-container mt-2 text-sm">
					{data.sentiment.error}
				</p>
				<Button class="mt-4" variant="secondary" onclick={() => data.sentiment.loadMsigs()}>
					Try Again
				</Button>
			</Card>
		{:else if data.sentiment.msigs.length === 0}
			<div class="py-12 text-center">
				<p class="text-on-surface-variant text-lg">No multisig proposals with sentiment data yet</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each sortedMsigs as msigData}
					<MsigCard {msigData} />
				{/each}
			</div>

			{#if data.sentiment.pagination?.hasMore}
				<div class="flex justify-center pt-4">
					<Button
						variant="secondary"
						onclick={() => data.sentiment.loadMore()}
						disabled={data.sentiment.loadingMore}
					>
						{data.sentiment.loadingMore ? 'Loading...' : 'Load More'}
					</Button>
				</div>
			{/if}
		{/if}
	</div>

	<Card title="About Multisig Sentiment">
		<Stack>
			<p>
				Express your support or opposition to multisig proposals. Your vote is weighted by your
				staked tokens, giving more influence to those with a larger stake in the network.
			</p>
			<p>
				This allows the community to signal their sentiment on governance proposals before or after
				they are approved, helping gauge overall community consensus.
			</p>

			<Button href={context.urlPath('/staking')} variant="secondary">Stake tokens</Button>
		</Stack>
	</Card>
</div>
