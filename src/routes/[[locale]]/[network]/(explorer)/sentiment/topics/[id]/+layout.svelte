<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { DiscussionSummary } from '$lib/discussion/summary.svelte';
	import { topicDescriptor } from '$lib/discussion/targets';
	import { mountSentimentPoll, POLL_CONTEXT } from '$lib/state/sentiment/poll.svelte';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	const poll = mountSentimentPoll(context, () => ({ kind: 'topic', id: data.topicId }), {
		initial: () => data.topic
	});
	setContext(POLL_CONTEXT, poll);

	const discussion = new DiscussionSummary(fetch, context.urlPath('/api/msg'));
	const contract = $derived(String(context.network.contracts.sentiment.account));
	const descriptor = $derived(topicDescriptor(contract, data.topicId));

	$effect(() => {
		if (!context.network.supports('discussion')) return;
		discussion.load([descriptor.tuple]);
	});

	const tabOptions = $derived.by(() => {
		const base = context.urlPath(`/sentiment/topics/${data.topicId}`);
		const tabs = [{ href: base, text: 'Overview' }];
		if (context.network.supports('discussion')) {
			tabs.push({
				href: `${base}/discussion`,
				text:
					discussion.loaded && !discussion.unavailable
						? `Discussion (${discussion.total})`
						: 'Discussion'
			});
		}
		return tabs;
	});
</script>

<Stack class="@container gap-6">
	{#if context.network.supports('discussion')}
		<PillGroup options={tabOptions} />
	{/if}
	{@render children?.()}
</Stack>
