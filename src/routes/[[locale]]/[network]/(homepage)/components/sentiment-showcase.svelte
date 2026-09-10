<script lang="ts">
	import { Button, Stack } from '@wharfkit/svelte-components';
	import type { TopicWithStats } from '$lib/types/sentiment';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import TopicCard from '$lib/components/sentiment/topicCard.svelte';

	interface Props {
		topics?: TopicWithStats[];
	}

	let { topics = [] }: Props = $props();
	const { urlPath } = getContext<UnicoveContext>('state');

	const displayTopics = $derived(topics.slice(0, 3));
</script>

<section class="@container grid grid-cols-2 items-start gap-x-4 gap-y-8">
	<div
		class="col-span-full row-start-1 grid items-center text-balance @3xl:col-span-1 @3xl:row-start-1"
	>
		<Stack class="max-w-md items-start">
			<h2 class="text-title leading-tight">Sentiment Voting</h2>
			<p>
				An experimental governance system being developed during Vaulta's transition period. Express
				your support or opposition on key network topics, with voting power weighted by your staked
				tokens.
			</p>
			<p>
				Topic creation is not yet available. Currently, only voting on existing proposals is
				supported.
			</p>
			<Button variant="primary" href={urlPath('/sentiment/topics')}>View All Topics</Button>
		</Stack>
	</div>

	<div class="col-span-full row-start-2 grid content-start gap-4 @3xl:col-start-2 @3xl:row-start-1">
		{#each displayTopics as topic}
			<TopicCard topicData={topic} />
		{/each}
	</div>
</section>
