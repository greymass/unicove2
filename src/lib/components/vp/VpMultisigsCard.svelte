<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import ApprovalProgress from '$lib/components/msig/approvalprogress.svelte';
	import { parseMsigApprovals, vpMsigSteps } from '$lib/vp/onchain';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
		basePath: string;
	}

	const { summary, basePath }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const locale = $derived(context.settings.data.locale);
	const steps = $derived(vpMsigSteps(summary, locale));
	const live = $derived(steps.find((s) => s.live) ?? null);
	const closed = $derived(steps.filter((s) => !s.live && !s.planned).length);
	const planned = $derived(steps.filter((s) => s.planned).length);

	let approved = $state<number | null>(null);
	let requested = $state<number | null>(null);
	let satisfied = $state<number | null>(null);
	let threshold = $state<number | null>(null);
	let possible = $state<number | null>(null);

	$effect(() => {
		const step = live;
		if (!step?.proposer || !step?.proposal) return;
		const controller = new AbortController();
		fetch(context.urlPath(`/api/msig/${step.proposer}/${step.proposal}`), {
			signal: controller.signal
		})
			.then((response) => response.json())
			.then((json) => {
				const msig = parseMsigApprovals(json);
				if (!msig) return;
				approved = msig.approved;
				requested = msig.requested;
				satisfied = msig.satisfied;
				threshold = msig.threshold;
				possible = msig.possible;
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<Card class="hover:bg-surface-container p-0 transition-colors">
	<a href="{basePath}/multisigs" class="block p-4">
		<div class="flex items-baseline justify-between gap-2">
			<h2 class="text-label-sm text-muted">Multisigs</h2>
			{#if live}
				<span class="text-primary text-label-sm">Awaiting signatures</span>
			{/if}
		</div>

		{#if live && approved !== null && requested !== null}
			<div class="mt-3">
				<ApprovalProgress {approved} {requested} {satisfied} {threshold} {possible} />
			</div>
			{#if closed}
				<p class="text-muted mt-2 text-sm">{closed} closed</p>
			{/if}
		{:else if live}
			<p class="text-muted mt-3 text-sm">One multisig is open for signatures.</p>
		{:else if planned}
			<p class="text-muted mt-3 text-sm">No step has been proposed on-chain yet.</p>
		{:else}
			<p class="text-muted mt-3 text-sm">No multisig is open for signatures.</p>
		{/if}

		<p class="text-primary border-outline mt-4 border-t pt-3 text-sm font-medium">
			View all {steps.length} multisigs
		</p>
	</a>
</Card>
