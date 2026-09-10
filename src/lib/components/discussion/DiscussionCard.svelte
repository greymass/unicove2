<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { DiscussionSummary } from '$lib/discussion/summary.svelte';
	import type { Tuple } from '$lib/msg/model';
	import { chainDate } from '$lib/msg/api';
	import '$lib/utils/dayjs';
	import dayjs from 'dayjs';

	interface Props {
		tuples: Tuple[];
		href: string;
		compact?: boolean;
	}

	const { tuples, href, compact = false }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const summary = new DiscussionSummary(fetch, context.urlPath('/api/msg'));

	$effect(() => {
		summary.load(tuples);
	});

	const latest = $derived(summary.latest);
	const teaser = $derived(latest?.last_message?.body?.split('\n')[0] ?? '');
</script>

{#if compact}
	<a {href} class="text-primary text-sm font-medium hover:underline">
		{#if summary.unavailable}
			Discussion is not available on this network.
		{:else if !summary.loaded}
			Read the discussion
		{:else if summary.total === 1}
			Read the discussion (1 comment)
		{:else}
			Read the discussion ({summary.total} comments)
		{/if}
	</a>
{:else}
	<Card class="hover:bg-surface-container p-0 transition-colors">
		<a {href} class="block p-4">
			<div class="flex items-baseline justify-between gap-2">
				<h2 class="text-label-sm text-muted">Discussion</h2>
				{#if summary.loaded && !summary.unavailable}
					<span class="text-muted text-label-sm">
						{#if summary.total === 1}1 comment{:else}{summary.total} comments{/if}
					</span>
				{/if}
			</div>
			{#if summary.unavailable}
				<p class="text-muted mt-3 text-sm">Discussion is not available on this network.</p>
			{:else if !summary.loaded}
				<div class="mt-3 animate-pulse">
					<div class="bg-surface-container h-4 w-24 rounded"></div>
				</div>
			{:else if latest?.last_message && latest.last_activity}
				<p class="text-muted mt-3 text-sm">
					{latest.last_message.sender} · {dayjs(chainDate(latest.last_activity)).fromNow()}
				</p>
				<p class="mt-1 truncate text-sm">{teaser}</p>
			{:else}
				<p class="text-muted mt-3 text-sm">No comments yet.</p>
			{/if}
			<p class="text-primary border-outline mt-4 border-t pt-3 text-sm font-medium">
				Read the discussion
			</p>
		</a>
	</Card>
{/if}
