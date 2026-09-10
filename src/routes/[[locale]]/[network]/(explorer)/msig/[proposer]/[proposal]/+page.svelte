<script lang="ts">
	import { getContext } from 'svelte';

	import { Button, Card, Chip, CopyButton, cn } from '@wharfkit/svelte-components';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';
	import { Stack, Switcher } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import { formatDateTime } from '$lib/utils/intl';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Account from '$lib/components/elements/account.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';
	import VoteButtons from '$lib/components/sentiment/voteButtons.svelte';
	import SentimentMeter from '$lib/components/sentiment/SentimentMeter.svelte';
	import DiscussionCard from '$lib/components/discussion/DiscussionCard.svelte';
	import { percentString } from '$lib/utils';
	import { POLL_CONTEXT, type SentimentPollBox } from '$lib/state/sentiment/poll.svelte';

	import { ApprovalManager } from './manager.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const pollBox = getContext<SentimentPollBox>(POLL_CONTEXT);
	const poll = $derived(pollBox.current);
	const sentimentStats = $derived(poll?.displayed ?? null);

	const manager = $state(new ApprovalManager(context, data.proposal, pollBox));
	$effect(() => {
		manager.sync(data.network, context.wharf);
	});

	const top21 = data.producers.slice(0, 21);

	const statusColors: Record<string, string> = {
		proposed: 'bg-primary text-on-primary',
		executed: 'bg-success text-on-success',
		cancelled: 'bg-surface-container-high text-on-surface-variant',
		expired: 'bg-error text-on-error'
	};

	const statusColor = $derived(statusColors[data.proposal.status] || statusColors.proposed);

	const locale = $derived(page.params.locale ?? 'en');
	// Chain timestamps arrive without a zone marker but are UTC.
	const parseChainDate = (value: string) => new Date(/[Zz+]/.test(value) ? value : `${value}Z`);
	const formatDate = (value: Date) =>
		formatDateTime(value, locale, { dateStyle: 'medium', timeStyle: 'short' });

	async function cancel() {
		await manager.cancel();
		goto(`/${data.network}/account/${data.proposal.proposer}/proposals`, {
			invalidateAll: true
		});
	}
</script>

{#snippet Complete()}
	<div class="flex gap-4">
		<Button onclick={() => manager.reset()}>Back</Button>
	</div>
{/snippet}

<Stack>
	<Switcher class="items-start gap-6" threshold="40rem">
		<Stack class="min-w-0 gap-4">
			<h2 class="text-title">Requested Approvals</h2>

			<div
				id="msig-vis"
				class="rounded-2xl pt-8 pb-4"
				style="
				--bg-pos: calc(100% - {manager.approvalRatio}%); 
				--ease: {manager.userHasApproved ? 'ease-out' : 'ease-in'};
				--duration: {manager.userHasApproved ? '1000ms' : '200ms'}"
			>
				<div class="flex justify-between px-4 font-semibold">
					<div class="">
						<span class="flex items-center gap-1 text-3xl">
							{manager.totalApproved}
						</span>
						Approved
					</div>

					<div class="text-right">
						<span class="flex items-center justify-end gap-1 text-3xl">
							{manager.threshold ?? manager.totalRequested}
						</span>
						{#if manager.threshold !== null}
							Needed of {manager.possible} possible
						{:else}
							Requested
						{/if}
					</div>
				</div>
			</div>
			<Card>
				<div class="overflow-x-auto">
					<table class="table-styles">
						<thead>
							<tr>
								<th class="text-left">Actor</th>
								<th class="text-left">Permission</th>
								<th class="text-left">Role</th>
								<th class="text-right">Status</th>
							</tr>
						</thead>
						<tbody>
							{#each manager.participants as participant}
								{@const isProducer = data.producers.includes(String(participant.actor))}
								{@const isTop21 = top21.includes(String(participant.actor))}
								<tr class="h-12 bg-none">
									<td><Account name={participant.actor} /></td>
									<td class="text-muted">{participant.permission}</td>
									<td>
										{#if isTop21}
											Top 21
										{:else if isProducer}
											Standby
										{:else}
											Signer
										{/if}
									</td>
									<td class="text-right">
										{#if manager.accountHasApproved(participant)}
											<span class="text-success">Approved</span>
										{:else}
											<span class="text-muted">Requested</span>
											{#if !manager.inBindingRoster(participant)}
												<span class="text-muted block text-xs">outside current authority</span>
											{/if}
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		</Stack>

		<Stack class="gap-4">
			<h2 class="text-title">Multisig Details</h2>

			<Card class="@container pt-3">
				<TransactForm
					id={manager.result?.resolved?.transaction.id}
					error={manager.error}
					onsuccess={Complete}
					onfailure={Complete}
				>
					<Stack class="gap-4" id="details">
						<DL>
							<DLRow title="Status">
								<DD>
									<Chip class={cn('ml-auto capitalize', statusColor)}>{data.proposal.status}</Chip>
								</DD>
							</DLRow>
							<DLRow title="Proposer">
								<DD>
									<Account name={manager.proposal.proposer} />
								</DD>
							</DLRow>
							<DLRow title="Proposal Name">
								<DD>
									{manager.proposal.name}
								</DD>
							</DLRow>
							<DLRow title={manager.expired ? 'Expired' : 'Expiration'}>
								<DD>
									{formatDate(manager.expiration)} ({manager.expiresIn})
								</DD>
							</DLRow>
							<DLRow title="Hash">
								<DD>
									<span class="inline-flex max-w-full items-center gap-1">
										<span class="break-all">{manager.proposal.hash}</span>
										<CopyButton data={String(manager.proposal.hash)} label="Copy hash" />
									</span>
								</DD>
							</DLRow>
							{#if data.proposal.status === 'executed' && data.proposal.executed_by}
								<DLRow title="Executed By">
									<DD>
										<Account name={data.proposal.executed_by} />
									</DD>
								</DLRow>
							{/if}
							{#if data.proposal.status === 'executed' && data.proposal.executed_at}
								<DLRow title="Executed At">
									<DD>
										{formatDate(parseChainDate(data.proposal.executed_at))}
									</DD>
								</DLRow>
							{/if}
						</DL>

						{#if manager.isActive}
							{#if manager.userIsApprover}
								{#if manager.userHasApproved}
									<Button
										variant="secondary"
										onclick={() => manager.unapprove()}
										disabled={context.wharf.transacting}>Unapprove</Button
									>
								{:else}
									<Button
										class="bg-success text-on-success"
										variant="primary"
										onclick={() => manager.approve()}
										disabled={context.wharf.transacting}>Approve</Button
									>
								{/if}
							{/if}

							{#if manager.userIsProposer}
								<Button variant="secondary" disabled={context.wharf.transacting} onclick={cancel}
									>Cancel MSIG</Button
								>
							{/if}

							<Button
								variant="primary"
								disabled={context.wharf.transacting}
								onclick={() => manager.execute()}>Execute</Button
							>
						{/if}
						{#if manager.unreconciledApproval}
							<p class="text-muted text-sm">
								Your approval change is on chain and the list will update shortly.
							</p>
						{/if}
					</Stack>
				</TransactForm>
			</Card>

			{#if context.network.supports('sentiment')}
				<h2 class="text-title">Community Sentiment</h2>
				<Card>
					<Stack class="gap-4">
						{#if sentimentStats && sentimentStats.totalVotes > 0}
							<div class="flex items-end justify-between gap-3">
								<div>
									<span class="text-headline text-success">
										{percentString(locale, sentimentStats.supportPercentage / 100, 0)}
									</span>
									<p class="text-muted text-sm">support</p>
								</div>
								<div class="text-right">
									<span class="text-title text-error">
										{percentString(locale, sentimentStats.oppositionPercentage / 100, 0)}
									</span>
									<p class="text-muted text-sm">oppose</p>
								</div>
							</div>
							<div>
								<SentimentMeter id="msig-status-sentiment" compact statistics={sentimentStats} />
								<p class="text-muted mt-2 text-sm">
									{#if sentimentStats.totalVotes === 1}
										1 vote recorded on-chain
									{:else}
										{sentimentStats.totalVotes} votes recorded on-chain
									{/if}
								</p>
							</div>
						{:else if sentimentStats}
							<p class="text-muted text-sm">No votes have been cast on this poll.</p>
						{:else}
							<div class="animate-pulse">
								<div class="bg-surface-container h-4 w-24 rounded"></div>
							</div>
						{/if}
						{#if context.account && poll}
							<VoteButtons {poll} />
						{/if}
						{#if context.network.supports('discussion')}
							<DiscussionCard
								compact
								tuples={[['msig', data.proposal.proposer, data.proposal.name]]}
								href={context.urlPath(
									`/msig/${data.proposal.proposer}/${data.proposal.name}/discussion`
								)}
							/>
						{/if}
					</Stack>
				</Card>
			{/if}
		</Stack>
	</Switcher>
</Stack>

{#if context.settings.data.debugMode}
	<pre>{JSON.stringify(manager.actions, null, 2)}</pre>
{/if}

<style>
	#msig-vis {
		background: linear-gradient(
			to right,
			var(--color-success) 50%,
			var(--color-surface-container) 50%
		);
		background-size: 200% 100%;
		background-position: var(--bg-pos);
		transition: all var(--ease) var(--duration);
	}
	#msig-vis > div {
		background: linear-gradient(
			to right,
			var(--color-on-success) 50%,
			var(--color-on-surface-variant) 50%
		);
		background-size: 200% 100%;
		background-position: var(--bg-pos);
		background-clip: text;
		color: transparent;
		transition: all var(--ease) var(--duration);
	}
</style>
