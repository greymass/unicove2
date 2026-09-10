<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Card, Label, Stack, Switch } from '@wharfkit/svelte-components';
	import type { CreateSwitchProps } from '@melt-ui/svelte';

	import ProposalCard from '../components/ProposalCard.svelte';
	import StatusFilter from '../components/StatusFilter.svelte';
	import EmptyState from '../components/EmptyState.svelte';
	import ProposalsHeader from '../components/ProposalsHeader.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { SettingKeys } from '$lib/state/settings.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	// Accumulate proposals data for infinite scroll
	let allProposals = $state(data.proposals);
	let currentOffset = $state(data.offset);
	let hasMore = $state(data.more);
	let isLoading = $state(false);

	const currentStatus = $derived(data.status);
	const accountName = $derived(String(data.name));

	// Get the account name being viewed from the page params
	const viewedAccountName = $derived(page.params.name);

	// Get the logged-in user's account name (if any)
	const loggedInAccountName = $derived(
		context.wharf.session ? String(context.wharf.session.actor) : undefined
	);

	const isOwnAccount = $derived(loggedInAccountName && loggedInAccountName === viewedAccountName);

	// Determine which account's approvals we should check
	// If viewing own account, use own permissions; otherwise use viewed account
	const checkAccountName = $derived(isOwnAccount ? loggedInAccountName : viewedAccountName);

	const checkPermission = $derived(
		isOwnAccount && context.wharf.session ? context.wharf.session.permissionLevel : undefined
	);

	// Get showApproved state from settings, default to false
	let showApproved = $state(context.settings.get(SettingKeys.showApprovedProposals, false));

	// Reset accumulated data when filters change
	$effect(() => {
		allProposals = data.proposals;
		currentOffset = data.offset;
		hasMore = data.more;
	});

	// Client-side filtering based on showApproved toggle
	const filteredProposals = $derived.by(() => {
		if (showApproved) {
			return allProposals;
		}
		// Filter out proposals where the account being viewed has already approved
		return allProposals.filter((proposal) => {
			// If we have a specific permission to check (viewing own account while logged in)
			if (checkPermission) {
				const hasApproved = proposal.provided_approvals?.some(
					(approval) =>
						String(approval.actor) === String(checkPermission.actor) &&
						String(approval.permission) === String(checkPermission.permission)
				);
				return !hasApproved;
			}
			// Otherwise check by account name only
			const hasApproved = proposal.provided_approvals?.some(
				(approval) => String(approval.actor) === checkAccountName
			);
			return !hasApproved;
		});
	});

	function handleStatusChange(status: string) {
		const url = new URL(page.url);
		if (status === 'all') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', status);
		}
		url.searchParams.delete('offset');
		goto(url.toString(), { replaceState: true });
	}

	const handleIncludeApprovedChange: CreateSwitchProps['onCheckedChange'] = ({ next }) => {
		showApproved = next || false;
		// Persist the setting
		context.settings.data.showApprovedProposals = showApproved;
		return next;
	};

	async function loadMore() {
		if (isLoading) return;

		isLoading = true;
		try {
			const newOffset = currentOffset + (data.limit || 20);
			const response = await context.network.msigs.get_approver_proposals(data.name, {
				status: currentStatus === 'all' ? undefined : currentStatus,
				include_approved: true,
				limit: data.limit || 20,
				offset: newOffset
			});

			// Append new proposals to existing data
			allProposals = [...allProposals, ...response.proposals];
			currentOffset = newOffset;
			hasMore = response.more;
		} catch (error) {
			console.error('Error loading more proposals:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<Stack class="">
	<ProposalsHeader {accountName}>
		<div class="flex items-center gap-4">
			<span class="flex flex-wrap items-center gap-x-4 gap-y-3">
				<Label for="show-approved">Show approved</Label>
				<Switch
					id="show-approved"
					checked={showApproved}
					onCheckedChange={handleIncludeApprovedChange}
				/>
			</span>
			<StatusFilter value={currentStatus} onchange={handleStatusChange} />
		</div>
	</ProposalsHeader>

	{#if isOwnAccount}
		<Card class="border-warning grid gap-2 border-2 bg-transparent">
			<span class="text-title text-warning"> Security Warning </span>
			<p class="text-warning text-pretty">
				Anyone can create a proposal for anything — including proposals that can compromise your
				account or assets.
				<strong>Do not sign a multisig if you're unsure of exactly what it does.</strong>
				Do not trust random messages asking you to sign these proposals.
			</p>
		</Card>
	{/if}

	{#if data.error}
		<div class="text-error">Failed to load proposals: {data.error}</div>
	{:else if filteredProposals.length === 0}
		<EmptyState
			title="No proposals pending"
			message={showApproved ? 'No proposals found' : 'No proposals are currently awaiting approval'}
		/>
	{:else}
		<div class="grid gap-4">
			{#each filteredProposals as proposal, index (`${proposal.proposer}-${proposal.proposal_name}-${index}`)}
				<ProposalCard
					{proposal}
					showApprovalStatus
					accountName={checkAccountName}
					permissionLevel={checkPermission}
				/>
			{/each}
		</div>

		{#if hasMore}
			<Button onclick={loadMore} variant="secondary" class="place-self-center" disabled={isLoading}>
				{isLoading ? 'Loading...' : 'Load More'}
			</Button>
		{/if}

		<p class="text-muted text-label-sm text-center">
			Showing {filteredProposals.length} of {data.total} total proposals
		</p>
	{/if}
</Stack>
