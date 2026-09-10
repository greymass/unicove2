<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import ApprovalProgress from '$lib/components/msig/approvalprogress.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import type { SentimentPollState } from '$lib/state/sentiment/poll.svelte';
	import { percentString } from '$lib/utils';
	import type { VpMsigApprovals, VpMsigStep } from '$lib/vp/onchain';

	interface Props {
		step: VpMsigStep;
		poll: SentimentPollState | null;
		approvals: VpMsigApprovals | null;
		approvalsLoaded: boolean;
	}

	const { step, poll, approvals, approvalsLoaded }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const locale = $derived(context.settings.data.locale);
	const symbol = $derived(context.network.chain.systemToken?.symbol.name ?? null);
	const displayed = $derived(poll?.displayed ?? null);
	const loaded = $derived(poll?.loaded ?? false);
	const showHolders = $derived(Boolean(poll) && (step.live || (displayed?.totalVotes ?? 0) > 0));
	const participantsPath = $derived(
		context.urlPath(`/msig/${step.proposer}/${step.proposal}/sentiment#participants`)
	);
</script>

{#if approvals || !approvalsLoaded || showHolders}
	<div class="mt-4 grid gap-3">
		{#if approvals || !approvalsLoaded}
			<div
				class="flex items-start gap-3"
				role="group"
				aria-labelledby="vp-step-signers-{step.proposer}-{step.proposal}"
			>
				<span
					id="vp-step-signers-{step.proposer}-{step.proposal}"
					class="text-muted text-label-sm w-16 shrink-0 pt-1">Signers</span
				>
				<div class="min-w-0 flex-1">
					{#if approvals}
						<ApprovalProgress
							approved={approvals.approved}
							requested={approvals.requested}
							satisfied={approvals.satisfied}
							threshold={approvals.threshold}
							possible={approvals.possible}
						/>
					{:else}
						<div class="grid gap-2" aria-hidden="true">
							<div class="bg-surface-container h-6 w-48 animate-pulse rounded"></div>
							<div class="bg-surface-container h-2 animate-pulse rounded-full"></div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if showHolders}
			<div
				class="flex items-start gap-3"
				role="group"
				aria-labelledby="vp-step-holders-{step.proposer}-{step.proposal}"
			>
				<span
					id="vp-step-holders-{step.proposer}-{step.proposal}"
					class="text-muted text-label-sm w-16 shrink-0 pt-1">Holders</span
				>
				<div class="min-w-0 flex-1">
					{#if displayed && displayed.totalVotes > 0}
						<p>
							<span class="text-headline-sm">
								{percentString(locale, displayed.supportPercentage / 100, 0)}
							</span>
							<span class="text-muted text-sm">
								{#if symbol}support by {symbol} weight{:else}support{/if} ·
								<a class="hover:text-primary underline underline-offset-2" href={participantsPath}>
									{#if displayed.totalVotes === 1}
										1 vote
									{:else}
										{displayed.totalVotes} votes
									{/if}
								</a>
							</span>
						</p>
						<div class="mt-2">
							<SentimentMeter
								id="vp-step-{step.proposer}-{step.proposal}"
								compact
								statistics={displayed}
							/>
						</div>
					{:else if loaded}
						<p class="text-muted text-sm">No votes yet on this step.</p>
					{:else}
						<div class="bg-surface-container h-4 w-40 animate-pulse rounded"></div>
					{/if}
				</div>
				{#if step.live && poll}
					<VoteButtons compact {poll} />
				{/if}
			</div>
		{/if}
	</div>
{/if}
