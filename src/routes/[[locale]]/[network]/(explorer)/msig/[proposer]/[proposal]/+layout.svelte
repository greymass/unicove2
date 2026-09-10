<script lang="ts">
	import { Card, Stack } from '@wharfkit/svelte-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext, setContext } from 'svelte';
	import { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';
	import { mountSentimentPoll, POLL_CONTEXT } from '$lib/state/sentiment/poll.svelte';
	import { DiscussionSummary } from '$lib/discussion/summary.svelte';
	import { msigDescriptor } from '$lib/discussion/targets';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	const sentimentState = $state(new MsigSentimentState(context.network, data.locale));
	setContext('msig-sentiment', sentimentState);

	const poll = mountSentimentPoll(context, () => ({
		kind: 'msig',
		proposer: data.proposal.proposer,
		proposal: data.proposal.name
	}));
	setContext(POLL_CONTEXT, poll);

	const discussion = new DiscussionSummary(fetch, context.urlPath('/api/msg'));
	const descriptor = $derived(
		msigDescriptor(data.proposal.proposer, data.proposal.name, data.proposal.status)
	);
	setContext('msig-discussion', discussion);

	$effect(() => {
		if (!context.network.supports('discussion')) return;
		discussion.load([descriptor.tuple]);
	});

	const tabOptions = $derived.by(() => {
		let urlBase = context.urlPath(`/msig/${data.proposal.proposer}/${data.proposal.name}`);
		const tabs = [{ href: urlBase, text: 'Status' }];
		if (context.network.supports('sentiment')) {
			tabs.push({ href: `${urlBase}/sentiment`, text: 'Sentiment' });
		}
		if (context.network.supports('discussion')) {
			tabs.push({
				href: `${urlBase}/discussion`,
				text:
					discussion.loaded && !discussion.unavailable
						? `Discussion (${discussion.total})`
						: 'Discussion'
			});
		}
		tabs.push(
			{ href: `${urlBase}/actions`, text: `Actions (${data.proposal.transaction.actions.length})` },
			{ href: `${urlBase}/transaction`, text: 'Transaction' },
			{ href: `${urlBase}/data`, text: 'Data' }
		);
		return tabs;
	});
</script>

<Stack class="@container">
	{#if data.vp}
		<Card>
			{#if data.vp.step}
				{@const live = data.proposal.status === 'proposed'}
				<div class="flex items-center gap-3">
					<span
						class="grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold {live
							? 'border-primary text-primary'
							: 'border-outline text-muted'}"
					>
						{data.vp.step.number}
					</span>
					<div class="min-w-0">
						{#if data.vp.step.title}
							<p class="text-title">{data.vp.step.title}</p>
						{/if}
						<p class="text-muted text-sm">
							Step {data.vp.step.number} of {data.vp.step.total} · Implements
							<a
								class="text-primary hover:underline"
								href={context.urlPath(`/proposals/${data.vp.slug}`)}
								>{data.vp.vp}: {data.vp.title}</a
							>
						</p>
					</div>
				</div>
			{:else}
				<p class="text-muted text-sm">
					Implements <a
						class="text-primary hover:underline"
						href={context.urlPath(`/proposals/${data.vp.slug}`)}>{data.vp.vp}: {data.vp.title}</a
					>
				</p>
			{/if}
		</Card>
	{/if}
	<PillGroup options={tabOptions} />
	{@render children?.()}
</Stack>
