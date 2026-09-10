<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Chip, Cluster, cn, Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Proposal } from '@wharfkit/msigs';
	import type { PermissionLevel } from '@wharfkit/antelope';
	import dayjs from 'dayjs';

	interface ProposalCardProps {
		proposal: Proposal;
		showApprovalStatus?: boolean;
		accountName?: string;
		permissionLevel?: PermissionLevel;
	}

	const {
		proposal,
		showApprovalStatus = false,
		accountName,
		permissionLevel
	}: ProposalCardProps = $props();

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const statusColors = {
		proposed: 'bg-primary text-on-primary',
		executed: 'bg-success text-on-success',
		cancelled: 'bg-surface-container-high text-on-surface-variant',
		expired: 'bg-error text-on-error'
	};

	const statusColor = $derived(statusColors[proposal.status] || statusColors.proposed);

	const expirationDate = $derived(dayjs(String(proposal.expiration)));
	const isExpired = $derived(expirationDate.isBefore(dayjs()));
	const expirationText = $derived(
		isExpired ? `Expired ${expirationDate.fromNow()}` : `Expires ${expirationDate.fromNow()}`
	);

	const userHasApproved = $derived.by(() => {
		if (!showApprovalStatus) return false;

		// If we have a specific permission level to check, use it (more precise)
		// TODO: Fix this check once PermissionLevel type is corrected in @wharfkit/msig
		if (permissionLevel) {
			return (
				proposal.provided_approvals?.some(
					(approval) =>
						String(approval.actor) === String(permissionLevel.actor) &&
						String(approval.permission) === String(permissionLevel.permission)
				) || false
			);
		}

		// Otherwise check by account name only
		if (accountName) {
			return (
				proposal.provided_approvals?.some((approval) => String(approval.actor) === accountName) ||
				false
			);
		}

		return false;
	});
</script>

<a
	href={urlPath(`/msig/${proposal.proposer}/${proposal.proposal_name}`)}
	class="group block hover:cursor-pointer"
>
	<Card class="group-hover:bg-surface-container @container">
		<Stack class="gap-6">
			<div class="flex flex-wrap items-start justify-between gap-2">
				<div class="flex flex-col gap-2">
					<h3 class="text-headline text-primary">
						{String(proposal.proposal_name)}
					</h3>
					<span class="text-muted text-label-sm">
						Proposed by {proposal.proposer}
					</span>
				</div>

				<Cluster>
					<Chip class={cn('capitalize', statusColor)}>{proposal.status}</Chip>
					{#if showApprovalStatus}
						{#if userHasApproved}
							<Chip class="text-on-success bg-success">Approved</Chip>
						{:else}
							<Chip class="text-on-warning bg-warning">Pending Approval</Chip>
						{/if}
					{/if}
				</Cluster>
			</div>

			<div class="grid items-start gap-4 @md:grid-cols-2 @xl:grid-cols-4 @3xl:grid-cols-5">
				{#if proposal.approvals_required}
					<div class="grid gap-1">
						<div class="text-muted text-label-sm">Approvals</div>

						<span class="text-body">
							{proposal.approvals_received}/{proposal.approvals_required}
						</span>
					</div>
				{/if}

				<div class="grid gap-1">
					<div class="text-muted text-label-sm">Expiration</div>
					<div class="text-body leading-5 text-pretty">
						{expirationText}
					</div>
				</div>

				<div class="grid gap-1">
					<div class="text-muted text-label-sm">Actions</div>
					<div class="text-body">
						{proposal.actions_count}
						{#if proposal.actions_count === 1}
							action
						{:else}
							actions
						{/if}
					</div>
				</div>

				<div class="grid gap-1">
					<div class="text-muted text-label-sm">Created</div>
					<div class="text-body">
						{dayjs(String(proposal.created_at)).format('MMM D, YYYY')}
					</div>
				</div>
			</div>
		</Stack>
	</Card>
</a>
