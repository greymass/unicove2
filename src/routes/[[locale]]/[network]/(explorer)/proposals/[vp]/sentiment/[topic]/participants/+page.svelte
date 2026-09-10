<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import MetricParticipants from '$lib/components/sentiment/MetricParticipants.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const systemSymbol = $derived(context.network.chain.systemToken!.symbol);
</script>

<article class="@container">
	<Stack class="gap-8">
		{#if data.votes.length > 0}
			<MetricParticipants
				votes={data.votes}
				lens="system"
				totalVotes={data.statistics.totalVotes}
				supportVotes={data.statistics.supportVotes}
				oppositionVotes={data.statistics.oppositionVotes}
				{systemSymbol}
			/>
		{:else}
			<Card>
				<p class="text-on-surface-variant">No votes on this poll yet.</p>
			</Card>
		{/if}
	</Stack>
</article>
