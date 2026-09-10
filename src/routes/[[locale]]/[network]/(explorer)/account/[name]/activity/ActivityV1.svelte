<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Name } from '@wharfkit/antelope';

	import { ActivityLoader } from './state.v1.svelte.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import { Button, Card } from '@wharfkit/svelte-components';
	import Trace from '$lib/components/elements/trace.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import GenericSummary from '$lib/components/summary/generic.svelte';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import type { ActivityResponseAction } from '$lib/types/transaction.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { formatDateTime } from '$lib/utils/intl';

	const { data } = $props();

	const networkName = String(data.network);
	const context = getContext<UnicoveContext>('state');

	onMount(() => {
		const loader = ActivityLoader.getInst(networkName, data.network.fetch);
		loader.setAccount(String(data.name));
		loader.load();
	});

	const activityLoader: ActivityLoader = $derived.by(() => {
		return ActivityLoader.getInst(networkName, data.network.fetch);
	});

	const isLoading = $derived.by(() => {
		const page = activityLoader.page;
		return page.isLoading && !page.results.length;
	});

	const hasMore = $derived(activityLoader.page.hasMore);
	const loadingText = $derived.by(() => {
		const page = activityLoader.page;
		if (!page.hasMore) return 'No more';
		if (page.isLoading) return 'Loading';
		return 'Load more';
	});

	const activityActions: ActivityResponseAction[] = $derived.by(() => {
		return [...activityLoader.page.results];
	});

	function clickLoadMore() {
		activityLoader.loadMore();
	}

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

{#if isLoading}
	<div class="flex items-center justify-center gap-4 py-20">
		<div class="bounce bounce-1 h-3 w-3 rounded-full bg-white"></div>
		<div class="bounce bounce-2 h-3 w-3 rounded-full bg-white"></div>
		<div class="bounce bounce-3 h-3 w-3 rounded-full bg-white"></div>
	</div>
{:else if !activityActions.length}
	<div class="flex items-center justify-center py-20">
		<p class="text-center text-gray-400">No activity found for this account.</p>
	</div>
{:else}
	{#if variant === 'table'}
		<Card class="p-0">
			<div class="w-full">
				<div class="bg-surface-container-low border-outline-variant hidden border-b md:flex">
					<div class="p-3 text-left text-sm font-semibold md:w-48 md:shrink-0">Date / TX</div>
					<div class="p-3 text-left text-sm font-semibold md:w-48 md:shrink-0">
						Contract / Action
					</div>
					<div class="p-3 text-left text-sm font-semibold md:flex-1">Data</div>
				</div>
				<div class="flex flex-col">
					{#each activityActions as activityAction}
						{@const contract = String(activityAction.trace.action.account)}
						{@const action = String(activityAction.trace.action.name)}
						{@const datetime = activityAction.trace.block_time.toDate()}
						{@const trxId = activityAction.trace.trx_id}
						{@const summary = getActionSummaryComponent(
							contract,
							action,
							activityAction.trace.act.data
						)}
						<div
							class="border-outline-variant hover:bg-surface-container-high flex flex-row flex-wrap gap-y-2 border-b p-3 last:border-0 md:flex-nowrap md:items-center md:gap-0 md:p-0"
						>
							<div class="flex w-1/2 flex-col text-sm md:w-48 md:shrink-0 md:p-3">
								<div class="whitespace-nowrap tabular-nums">
									{formatDateTime(datetime, data.locale || 'en', {
										dateStyle: 'short',
										timeStyle: 'medium'
									})}
								</div>
								<div class="text-on-surface-variant font-mono text-xs">
									<Transaction id={trxId} />
								</div>
							</div>
							<div
								class="flex w-1/2 flex-col items-end text-right text-sm md:w-48 md:shrink-0 md:items-start md:p-3 md:text-left"
							>
								<div class="font-semibold">
									<Contract name={Name.from(contract)} action={Name.from(action)}>
										{action}
									</Contract>
								</div>
								<div class="text-on-surface-variant text-xs">
									<Contract name={Name.from(contract)}>
										{contract}
									</Contract>
								</div>
							</div>
							<div class="w-full overflow-hidden text-sm md:flex-1 md:p-3">
								{#if summary}
									{@const SummaryComponent = summary}
									<SummaryComponent
										action={activityAction.trace.action}
										data={activityAction.trace.act.data}
									/>
								{:else if activityAction.trace.act.data}
									<GenericSummary data={activityAction.trace.act.data} />
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Card>
	{:else}
		<ol class="grid gap-12">
			{#each activityActions as activityAction}
				{@const contract = String(activityAction.trace.action.account)}
				{@const action = String(activityAction.trace.action.name)}
				{@const summary = getActionSummaryComponent(
					contract,
					action,
					activityAction.trace.act.data
				)}
				<li class="">
					<Trace
						perspectiveOf={Name.from(data.name)}
						trace={activityAction.trace}
						{summary}
						date
						trxid
						{variant}
					/>
				</li>
			{/each}
		</ol>
	{/if}
	{#if hasMore}
		<Button onclick={clickLoadMore} variant="primary" class="place-self-center">
			{loadingText}
		</Button>
	{/if}
{/if}

<style>
	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	}

	.bounce {
		animation: bounce 1.4s infinite ease-in-out;
	}

	.bounce-1 {
		animation-delay: 0s;
	}

	.bounce-2 {
		animation-delay: 0.2s;
	}

	.bounce-3 {
		animation-delay: 0.4s;
	}
</style>
