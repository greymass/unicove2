<script lang="ts">
	import { getContext } from 'svelte';
	import { Name } from '@wharfkit/antelope';
	import { Button } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { ThreadState } from '$lib/discussion/thread.svelte';
	import { defaultPostTarget, shortLabel, type TargetDescriptor } from '$lib/discussion/targets';
	import { buildComment, packContent } from '$lib/msg/content';
	import { abilityFor, isBlocked, loadGate, type PostAbility } from '$lib/msg/gate';
	import { GOVERNANCE_CHANNEL, tupleKey } from '$lib/msg/model';
	import { commentKey, visibleComments, type Comment as ThreadComment } from '$lib/msg/reconcile';
	import Comment from './Comment.svelte';
	import Composer from './Composer.svelte';

	interface Props {
		descriptors: TargetDescriptor[];
		active: TargetDescriptor | null;
		votes: Map<string, number>;
		multiTarget: boolean;
		locale: string;
		seed?: ThreadComment[];
	}

	const { descriptors, active, votes, multiTarget, locale, seed = [] }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const apiBase = context.urlPath('/api/msg');
	const msgAccount = String(context.network.contracts.msg.account);
	const tuples = $derived((active ? [active] : descriptors).map((d) => d.tuple));

	let thread = $state<ThreadState>(new ThreadState(fetch, apiBase, []));
	$effect(() => {
		const next = new ThreadState(fetch, apiBase, tuples);
		thread = next;
		next.load();
		return () => next.stop();
	});

	const viewer = $derived(context.account ? String(context.account.name) : null);
	const signedIn = $derived(Boolean(context.wharf.session && context.account));
	const target = $derived(defaultPostTarget(descriptors, active));

	let ability = $state<PostAbility | null>(null);
	$effect(() => {
		const account = context.account;
		if (!account) {
			ability = null;
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const [gate, blocked] = await Promise.all([
					loadGate(context.network.client, msgAccount, GOVERNANCE_CHANNEL),
					isBlocked(context.network.client, msgAccount, GOVERNANCE_CHANNEL, String(account.name))
				]);
				if (cancelled) return;
				ability = abilityFor(gate, account.balance.balance, blocked);
			} catch {
				if (!cancelled) ability = { ok: true };
			}
		})();
		return () => {
			cancelled = true;
		};
	});

	const labelByKey = $derived(new Map(descriptors.map((d) => [d.key, shortLabel(d)])));
	const activeKeys = $derived(new Set(tuples.map(tupleKey)));
	const seedVisible = $derived(seed.filter((c) => activeKeys.has(tupleKey(c.tags ?? []))));
	const comments = $derived([...seedVisible, ...visibleComments(thread.comments)]);
	const showJump = $derived(
		comments.length > 0 && target?.postable === true && ability?.ok !== false
	);

	let composerNode = $state<HTMLElement>();
	function jumpToComposer() {
		composerNode?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		composerNode?.querySelector('textarea')?.focus({ preventScroll: true });
	}

	async function post(body: string) {
		if (!context.account || !target) return;
		const fields = buildComment(target.target, body);
		const content = packContent(fields);
		const sender = context.account.name;
		const action = context.network.contracts.msg.action('send', {
			sender,
			channel: Name.from(GOVERNANCE_CHANNEL),
			content
		});
		const result = await context.wharf.transact({ action });
		thread.addPending(String(sender), fields, String(result.resolved?.transaction.id ?? ''));
	}

	async function edit(seq: number, body: string) {
		const existing = thread.comments.find((c) => c.seq === seq);
		if (!context.account || !existing) return;
		const targetOf = descriptors.find((d) => tupleKey(d.tuple) === tupleKey(existing.tags ?? []));
		if (!targetOf) throw new Error('Unknown comment target');
		const fields = buildComment(targetOf.target, body);
		const action = context.network.contracts.msg.action('edit', {
			sender: context.account.name,
			channel: Name.from(GOVERNANCE_CHANNEL),
			seq,
			content: packContent(fields)
		});
		await context.wharf.transact({ action });
		thread.applyEdit(seq, fields.body);
	}

	async function remove(seq: number) {
		if (!context.account) return;
		const action = context.network.contracts.msg.action('del', {
			sender: context.account.name,
			channel: Name.from(GOVERNANCE_CHANNEL),
			seq
		});
		await context.wharf.transact({ action });
		thread.markDeleted(seq);
	}
</script>

<div class="grid max-w-[40rem] gap-6">
	{#if thread.error}
		<div
			class="bg-error/10 text-error border-error/30 flex items-center justify-between gap-2 rounded border px-4 py-2 text-sm"
		>
			<span>{thread.error}</span>
			<Button variant="text" class="text-error" onclick={() => thread.refresh()}>Try Again</Button>
		</div>
	{/if}

	{#if thread.unavailable}
		<p class="text-muted text-sm">Discussion is not available on this network.</p>
	{:else if !thread.ready}
		<div class="grid animate-pulse gap-3" role="status" aria-busy="true">
			<span class="sr-only">Loading comments</span>
			<div class="bg-surface-container h-16 rounded"></div>
			<div class="bg-surface-container h-16 rounded"></div>
		</div>
	{:else}
		{#if showJump}
			<div>
				<Button variant="secondary" onclick={jumpToComposer}>Write a comment</Button>
			</div>
		{/if}
		{#if thread.hasMore}
			<div>
				<Button variant="secondary" onclick={() => thread.loadEarlier()}
					>Load earlier comments</Button
				>
			</div>
		{/if}
		<div class="grid gap-8" aria-live="polite" aria-relevant="additions">
			{#if comments.length === 0}
				<p
					class="border-outline text-muted rounded-xl border border-dashed p-4 text-center text-sm"
				>
					No comments yet.
				</p>
			{:else}
				{#each comments as comment (commentKey(comment))}
					<Comment
						{comment}
						vote={votes.get(comment.sender) ?? null}
						{viewer}
						{locale}
						showTarget={multiTarget && active === null}
						targetLabel={labelByKey.get(tupleKey(comment.tags ?? [])) ?? null}
						ondelete={remove}
						onedit={edit}
					/>
				{/each}
			{/if}
		</div>
		<div bind:this={composerNode} class="grid gap-3">
			<Composer {signedIn} {ability} {multiTarget} {target} onpost={post} />
			<p class="text-muted text-xs">
				Comments are on-chain messages signed by your account and are public and permanent.
				Moderators remove comments that are spam, impersonation, harassment, or unrelated to what is
				being discussed, and block accounts that repeat it. A removed comment stays on chain and
				stops appearing on Unicove.
			</p>
		</div>
	{/if}
</div>
