<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { vpRouteTabs } from '$lib/vp/routes';
	import VpMultisigsCard from '$lib/components/vp/VpMultisigsCard.svelte';
	import VpSentimentCard from '$lib/components/vp/VpSentimentCard.svelte';
	import VpDetailsCard from '$lib/components/vp/VpDetailsCard.svelte';
	import VpRelatedAccounts from '$lib/components/vp/VpRelatedAccounts.svelte';
	import DiscussionCard from '$lib/components/discussion/DiscussionCard.svelte';
	import { DiscussionSummary } from '$lib/discussion/summary.svelte';
	import { proposalDescriptors } from '$lib/discussion/targets';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	// basePath keeps the URL's own vp form since PillGroup matches tabs via pathname.startsWith.
	const basePath = $derived(context.urlPath(`/proposals/${page.params.vp}`));
	const sentimentEnabled = $derived(context.network.supports('sentiment'));
	const discussionEnabled = $derived(context.network.supports('discussion'));
	const hasOnchain = $derived(data.summary.msigs.length > 0 || data.summary.sentiment.length > 0);
	const descriptors = $derived(proposalDescriptors(data.summary, data.lang));
	const discussion = new DiscussionSummary(fetch, context.urlPath('/api/msg'));
	$effect(() => {
		if (discussionEnabled) discussion.load(descriptors.map((d) => d.tuple));
	});
	const tabs = $derived(
		vpRouteTabs(basePath, data.summary, {
			sentimentEnabled: context.network.supports('sentiment'),
			discussionEnabled,
			revisionCount: data.revisions.length
		})
	);

	const tabOptions = $derived.by(() => {
		const options: { href: string; text: string }[] = [];
		for (const tab of tabs) {
			if (tab.kind === 'documents') {
				options.push({ href: tab.href, text: `Documents (${tab.count})` });
			} else if (tab.kind === 'multisigs') {
				options.push({ href: tab.href, text: `Multisigs (${tab.count})` });
			} else if (tab.kind === 'sentiment') {
				options.push({ href: tab.href, text: 'Sentiment' });
			} else if (tab.kind === 'discussion') {
				options.push({
					href: tab.href,
					text:
						discussion.loaded && !discussion.unavailable
							? `Discussion (${discussion.total})`
							: 'Discussion'
				});
			} else if (tab.kind === 'revisions') {
				options.push({ href: tab.href, text: `Revisions (${tab.count})` });
			} else {
				options.push({ href: tab.href, text: 'Proposal' });
			}
		}
		return options;
	});
</script>

<Stack class="@container gap-6">
	<PillGroup options={tabOptions} />

	<div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
		<div class="min-w-0">
			{@render children?.()}
		</div>

		<Stack
			tag="aside"
			class="gap-6 self-start xl:sticky xl:top-4 xl:max-h-[calc(100svh-2rem)] xl:overflow-y-auto"
		>
			{#if data.summary.msigs.length}
				<VpMultisigsCard summary={data.summary} {basePath} />
			{/if}
			{#if sentimentEnabled && (data.summary.sentiment.length || data.summary.msigs.some((m) => m.status === 'active'))}
				<VpSentimentCard summary={data.summary} {basePath} />
			{/if}
			{#if discussionEnabled && descriptors.length}
				<DiscussionCard tuples={descriptors.map((d) => d.tuple)} href="{basePath}/discussion" />
			{/if}
			{#if !hasOnchain}
				<Card>
					<p class="text-muted text-sm">
						Nothing on-chain yet. Voting opens when a topic is published or a multisig is proposed.
					</p>
				</Card>
			{/if}
			<VpDetailsCard summary={data.summary} revisions={data.revisions} branch={data.branch} />
			<VpRelatedAccounts accounts={data.summary.accounts} />
		</Stack>
	</div>
</Stack>
