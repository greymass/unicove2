<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import Thread from '$lib/components/discussion/Thread.svelte';
	import { topicDescriptor } from '$lib/discussion/targets';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const descriptor = $derived(
		topicDescriptor(String(context.network.contracts.sentiment.account), data.topicId)
	);
	const votes = $derived(new Map(data.sentiment.currentVotes.map((v) => [v.voter, v.voteType])));
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
