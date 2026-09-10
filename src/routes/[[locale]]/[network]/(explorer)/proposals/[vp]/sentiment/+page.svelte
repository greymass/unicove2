<!-- .../proposals/[vp]/sentiment/+page.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpSentimentHero from '$lib/components/vp/VpSentimentHero.svelte';
	import { vpProposalTopicRows } from '$lib/vp/sentiment';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const basePath = $derived(context.urlPath(`/proposals/${page.params.vp}`));
	const topicRows = $derived(vpProposalTopicRows(data.summary));
</script>

<Stack class="gap-8">
	{#if !topicRows.length}
		<p class="text-muted text-sm">
			No sentiment yet. Voting opens when a topic is published for this proposal.
		</p>
	{:else}
		{#each topicRows as row (row.topic)}
			<VpSentimentHero
				{row}
				{basePath}
				question="Do you support {data.summary.vp}: {data.summary.title}?"
			/>
		{/each}
	{/if}
</Stack>
