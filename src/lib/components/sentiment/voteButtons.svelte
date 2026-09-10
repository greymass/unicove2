<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { SentimentPollState } from '$lib/state/sentiment/poll.svelte';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		poll: SentimentPollState;
		disabled?: boolean;
		showVoter?: boolean;
		compact?: boolean;
	}

	const {
		poll,
		disabled = false,
		showVoter: showVoterProp = true,
		compact = false
	}: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const showVoter = $derived(compact ? false : showVoterProp);
	const voting = $derived(poll.signing);
	const error = $derived(poll.error);
	const pending = $derived(poll.ownVote === undefined);
	const vote = $derived(poll.ownVote ?? null);
	const supports = $derived(vote === 1);
	const opposes = $derived(vote === 0);
	const signedIn = $derived(Boolean(context.wharf.session && context.account));
	const canAct = $derived(signedIn && !disabled && !voting);
	const votingWeight = $derived(
		poll.ownWeight
			? Asset.fromUnits(poll.ownWeight.system.total, context.network.config.systemtoken.symbol)
			: null
	);
	const captionKind = $derived(
		poll.unreconciled && poll.expected ? (poll.expected.vote === null ? 'removed' : 'voted') : null
	);

	let pressed = $state<number | null>(null);

	async function handleCompactClick(voteType: 0 | 1) {
		if (!signedIn) {
			context.wharf.login();
			return;
		}
		pressed = voteType;
		try {
			if (vote === voteType) {
				await poll.remove();
			} else {
				await poll.vote(voteType);
			}
		} finally {
			pressed = null;
		}
	}

	const choiceBase =
		'flex flex-1 flex-col items-center gap-1.5 rounded-lg border border-transparent px-3 py-3 text-label-sm transition-colors';
	const frame = 'flex gap-2 rounded-xl border border-outline p-2';
	const compactChoice =
		'grid size-11 shrink-0 place-items-center rounded-lg border border-transparent transition-colors';
</script>

<div class="grid gap-3">
	{#if compact}
		<div class="grid justify-items-end gap-1">
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => handleCompactClick(1)}
					disabled={signedIn && (pending || voting)}
					aria-pressed={supports}
					aria-label={signedIn
						? supports
							? 'Remove your support'
							: 'Support this step'
						: 'Connect a wallet to support this step'}
					class={cn(
						compactChoice,
						supports
							? 'bg-success-container text-on-success-container border-success'
							: 'text-muted hover:bg-surface-container hover:text-success cursor-pointer'
					)}
				>
					{#if voting && pressed === 1}
						<LoaderCircle class="size-5 animate-spin" />
					{:else}
						<ThumbsUp class="size-5" />
					{/if}
				</button>
				<button
					type="button"
					onclick={() => handleCompactClick(0)}
					disabled={signedIn && (pending || voting)}
					aria-pressed={opposes}
					aria-label={signedIn
						? opposes
							? 'Remove your opposition'
							: 'Oppose this step'
						: 'Connect a wallet to oppose this step'}
					class={cn(
						compactChoice,
						opposes
							? 'bg-error-container text-on-error-container border-error'
							: 'text-muted hover:bg-surface-container hover:text-error cursor-pointer'
					)}
				>
					{#if voting && pressed === 0}
						<LoaderCircle class="size-5 animate-spin" />
					{:else}
						<ThumbsDown class="size-5" />
					{/if}
				</button>
			</div>
			{#if error}
				<p class="text-error w-40 text-right text-xs" role="alert">{error}</p>
			{/if}
			{#if captionKind === 'removed'}
				<p class="text-muted w-40 text-right text-xs">
					Your vote has been withdrawn and the results will update shortly.
				</p>
			{:else if captionKind === 'voted'}
				<p class="text-muted w-40 text-right text-xs">
					Your vote is on chain and will appear in the results shortly.
				</p>
			{/if}
		</div>
	{:else}
		{#if error}
			<div class="bg-error-container text-on-error-container rounded p-3 text-sm">
				<strong class="block">Your vote was not recorded</strong>
				{error}
			</div>
		{/if}

		{#if !signedIn}
			<div
				class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm"
			>
				Connect a wallet to add your voice. Results stay visible either way.
			</div>
		{:else if pending}
			<div class={frame} aria-hidden="true">
				<div class="bg-surface-container h-16 flex-1 animate-pulse rounded-lg"></div>
				<div class="bg-surface-container h-16 flex-1 animate-pulse rounded-lg"></div>
			</div>
		{:else if voting}
			<div class="border-outline rounded-xl border p-6 text-center">
				<p class="text-muted text-sm">Waiting for your wallet to sign</p>
			</div>
		{:else}
			<div class={frame}>
				<button
					onclick={() => !supports && poll.vote(1)}
					disabled={!canAct || supports}
					class={cn(
						choiceBase,
						supports
							? 'bg-success-container text-on-success-container border-success'
							: 'hover:bg-surface-container hover:text-success cursor-pointer'
					)}
				>
					<ThumbsUp class="size-5" />
					Support
				</button>
				<button
					onclick={() => !opposes && poll.vote(0)}
					disabled={!canAct || opposes}
					class={cn(
						choiceBase,
						opposes
							? 'bg-error-container text-on-error-container border-error'
							: 'hover:bg-surface-container hover:text-error cursor-pointer'
					)}
				>
					<ThumbsDown class="size-5" />
					Oppose
				</button>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-2 text-sm">
				<p class="text-muted">
					{#if vote === null}
						{#if showVoter && votingWeight}
							Your weight: <AssetText variant="full" value={votingWeight} />
						{/if}
					{:else if showVoter && votingWeight}
						{supports ? 'You supported' : 'You opposed'} with
						<AssetText variant="full" value={votingWeight} />
					{:else}
						{supports ? 'You supported' : 'You opposed'}
					{/if}
				</p>
				{#if vote !== null}
					<button
						onclick={() => poll.remove()}
						disabled={!canAct}
						class="text-primary cursor-pointer hover:underline"
					>
						Remove vote
					</button>
				{/if}
			</div>
			{#if captionKind === 'removed'}
				<p class="text-muted text-sm">
					Your vote has been withdrawn and the results will update shortly.
				</p>
			{:else if captionKind === 'voted'}
				<p class="text-muted text-sm">
					Your vote is on chain and will appear in the results shortly.
				</p>
			{/if}
		{/if}
	{/if}
</div>
