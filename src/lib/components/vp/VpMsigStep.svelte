<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Chip } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpMsigStepResults from '$lib/components/vp/VpMsigStepResults.svelte';
	import type { VpMsigStep } from '$lib/vp/onchain';
	import { mountSentimentPoll } from '$lib/state/sentiment/poll.svelte';
	import { vpStepHasPoll } from '$lib/vp/sentiment';

	interface Props {
		step: VpMsigStep;
		basePath: string;
		last: boolean;
	}

	const { step, basePath, last }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const hasPoll = $derived(vpStepHasPoll(step));
	const pollBox = mountSentimentPoll(
		context,
		() =>
			hasPoll && step.proposer && step.proposal
				? { kind: 'msig', proposer: step.proposer, proposal: step.proposal }
				: null,
		{ live: () => step.live }
	);
	const poll = $derived(pollBox.current);
	const approvals = $derived(poll?.approvals?.summary ?? null);
	const approvalsLoaded = $derived(!hasPoll || (poll?.approvalsLoaded ?? false));
	const unavailable = $derived(Boolean(poll?.approvalsLoaded && !poll.approvals));

	const statusLabels: Record<string, string> = {
		planned: 'Planned',
		active: 'Open for signatures',
		executed: 'Executed',
		expired: 'Expired',
		cancelled: 'Cancelled'
	};

	const statusVariants: Record<string, string> = {
		planned: 'opacity-60',
		active: 'bg-primary-container text-on-primary-container',
		executed: 'bg-success-container text-on-success-container',
		expired: 'bg-error-container text-on-error-container',
		cancelled: 'bg-error-container text-on-error-container'
	};
</script>

<div class="relative pl-12" class:pb-6={!last}>
	{#if !last}
		<span class="bg-outline absolute top-10 bottom-0 left-[17px] w-0.5"></span>
	{/if}
	<span
		class="absolute top-0 left-0 grid size-9 place-items-center rounded-full border-2 text-sm font-semibold"
		class:border-primary={step.live}
		class:text-primary={step.live}
		class:border-outline={!step.live}
		class:text-muted={!step.live}
	>
		{step.step}
	</span>

	<Card class={step.live ? 'ring-primary ring-1' : undefined}>
		<div class="flex flex-wrap items-start justify-between gap-2">
			<div class="min-w-0">
				{#if step.title}
					<h2 class="text-title">{step.title}</h2>
				{:else}
					<h2 class="text-title">Step {step.step}</h2>
				{/if}
				{#if step.proposer && step.proposal}
					<p class="mt-1 font-mono text-sm">
						{#if step.msigPath}
							<a
								class="text-muted hover:text-primary hover:underline"
								href={context.urlPath(step.msigPath)}
							>
								{step.proposer}/{step.proposal}
							</a>
						{:else}
							<span class="text-muted">{step.proposer}/{step.proposal}</span>
						{/if}
					</p>
				{:else if !step.title}
					<p class="text-muted mt-1 text-sm">This step has not been proposed on-chain yet.</p>
				{/if}
			</div>
			<Chip class="shrink-0 whitespace-nowrap {statusVariants[step.status] ?? ''}"
				>{statusLabels[step.status]}</Chip
			>
		</div>

		{#if approvals?.actions.length}
			<div class="mt-3 flex flex-wrap gap-1.5">
				{#each approvals.actions as action (action)}
					<span class="bg-surface-container-high text-muted rounded px-2 py-0.5 font-mono text-xs">
						{action}
					</span>
				{/each}
			</div>
		{:else if !approvalsLoaded && step.proposer && step.proposal}
			<div class="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
				<span class="bg-surface-container h-[22px] w-44 animate-pulse rounded"></span>
			</div>
		{/if}

		<VpMsigStepResults {step} {poll} {approvals} {approvalsLoaded} />

		{#if step.live && unavailable}
			<p class="text-muted mt-3 text-sm">No live approval data on this network.</p>
		{/if}

		<div class="mt-4 flex flex-wrap gap-2">
			{#if step.msigPath}
				<a
					class="bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-semibold"
					href={context.urlPath(step.msigPath)}
				>
					Open the multisig
				</a>
			{/if}
			{#if step.txPath}
				<a
					class="border-outline text-primary rounded-lg border px-4 py-2 text-sm font-semibold"
					href={context.urlPath(step.txPath)}
				>
					View the transaction
				</a>
			{/if}
			{#if context.network.supports('discussion') && step.proposer && step.proposal}
				<a
					class="border-outline text-primary rounded-lg border px-4 py-2 text-sm font-semibold"
					href="{basePath}/discussion?target=msig:{step.proposer}:{step.proposal}"
				>
					Read the discussion
				</a>
			{/if}
		</div>
	</Card>
</div>
