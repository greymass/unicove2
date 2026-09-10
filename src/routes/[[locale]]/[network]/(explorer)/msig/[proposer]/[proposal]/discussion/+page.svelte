<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import Thread from '$lib/components/discussion/Thread.svelte';
	import { msigDescriptor } from '$lib/discussion/targets';
	import type { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';

	const { data } = $props();
	const sentimentState = getContext<MsigSentimentState>('msig-sentiment');

	const descriptor = $derived(
		msigDescriptor(data.proposal.proposer, data.proposal.name, data.proposal.status)
	);
	const votes = $derived(new Map(sentimentState.currentVotes.map((v) => [v.voter, v.voteType])));

	onMount(() => {
		if (sentimentState.currentVotes.length === 0) {
			sentimentState.loadMsigVotes(data.proposal.proposer, data.proposal.name, 1, 50, 'system');
		}
	});
</script>

<article class="@container">
	<Stack class="gap-6">
		<h2 class="text-on-surface text-headline">Discussion</h2>
		<Thread
			descriptors={[descriptor]}
			active={descriptor}
			{votes}
			multiTarget={false}
			locale={data.locale || 'en'}
		/>
	</Stack>
</article>
