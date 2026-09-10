<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { Stack } from '@wharfkit/svelte-components';
	import { SvelteMap } from 'svelte/reactivity';
	import Thread from '$lib/components/discussion/Thread.svelte';
	import TargetNav from '$lib/components/discussion/TargetNav.svelte';
	import { descriptorFromParam, proposalDescriptors } from '$lib/discussion/targets';
	import { mockComments } from '$lib/discussion/mock';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const descriptors = $derived(proposalDescriptors(data.summary, data.lang));
	const active = $derived(descriptorFromParam(descriptors, page.url.searchParams.get('target')));
	const seed = $derived(data.summary.slug.startsWith('vp-9999') ? mockComments(descriptors) : []);

	const votes = new SvelteMap<string, number>();

	$effect(() => {
		for (const d of descriptors) {
			const path =
				d.target.kind === 'msig'
					? `/api/sentiment/msigs/${d.target.proposer}/${d.target.proposal}/votes?page=1&limit=200`
					: `/api/sentiment/topics/${d.target.topic}/votes?page=1&limit=200`;
			fetch(context.urlPath(path))
				.then((r) => (r.ok ? r.json() : null))
				.then((json) => {
					for (const v of json?.data?.votes ?? []) votes.set(v.voter, v.voteType);
				})
				.catch(() => {});
		}
	});
</script>

<article class="@container">
	<Stack class="gap-6">
		{#if descriptors.length > 1}
			<TargetNav {descriptors} />
		{/if}
		<Thread
			{descriptors}
			{active}
			{votes}
			{seed}
			multiTarget={descriptors.length > 1}
			locale={data.lang}
		/>
	</Stack>
</article>
