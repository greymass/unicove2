<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, cn } from '@wharfkit/svelte-components';
	import Account from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ActivityEvent } from '@wharfkit/msigs';
	import dayjs from 'dayjs';
	import { FilePlus, XCircle, BadgeCheck, CirclePlay, BadgeX } from '@lucide/svelte/icons';
	import Block from '$lib/components/elements/block.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';

	interface ActivityEventProps {
		event: ActivityEvent;
	}

	const { event }: ActivityEventProps = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const actionIcons = {
		proposed: FilePlus,
		approved: BadgeCheck,
		unapproved: BadgeX,
		executed: CirclePlay,
		cancelled: XCircle
	};

	const actionColors = {
		proposed: 'text-on-primary bg-primary',
		approved: 'text-on-success bg-success',
		unapproved: 'text-on-warning bg-warning',
		executed: 'text-success',
		cancelled: 'text-error'
	};

	const ActionIcon = $derived(actionIcons[event.action]);
	const actionColor = $derived(actionColors[event.action]);

	const timestamp = $derived(dayjs(String(event.timestamp)));
	const relativeTime = $derived(timestamp.fromNow());
	const absoluteTime = $derived(timestamp.format('MMM D, YYYY [at] h:mm A'));
</script>

<div class="group @container relative grid grid-cols-[auto_1fr] gap-6">
	<div
		class="relative mt-5 grid h-full justify-items-center *:col-start-1 *:row-start-1 @2xl:mt-0 @2xl:place-items-center"
	>
		<!-- Line -->
		<div
			class="border-surface-container-high h-full -translate-y-full border border-2 border-l group-first:hidden @2xl:-translate-y-1/2"
		></div>

		<picture
			class={cn(
				'bg-surface-container-high z-10 grid size-12 place-items-center rounded-full',
				actionColor
			)}
		>
			<ActionIcon />
		</picture>
	</div>

	<Card class="">
		<div class="grid gap-4 @lg:grid-cols-2 @2xl:grid-cols-4">
			<hgroup class="flex flex-col gap-1">
				<h3 class="text-title leading-6">
					<span class="capitalize">{event.action}</span>
					<a
						href={urlPath(`/msig/${event.proposer}/${event.proposal_name}`)}
						class="text-primary hover:underline"
					>
						{String(event.proposal_name)}
					</a>
				</h3>

				<p class="text-label-sm text-muted leading-4">
					Proposed by
					<Account name={event.proposer}>
						{String(event.proposer)}
					</Account>
				</p>
			</hgroup>

			<div class="*:block">
				<span>Transaction</span>
				<Transaction id={event.trx_id} />
			</div>

			<div class="*:block">
				<span>Block</span>
				<Block number={event.globalseq} />
			</div>

			<div
				class="text-body *:block @lg:col-start-2 @lg:row-start-1 @2xl:col-start-4 @2xl:row-start-1 @2xl:text-right"
			>
				<span class="">{relativeTime}</span>
				<span class="text-muted text-label-sm">{absoluteTime}</span>
			</div>
		</div>
	</Card>
</div>
