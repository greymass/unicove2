<script lang="ts">
	import { Name } from '@wharfkit/antelope';
	import { ChevronsUpDownIcon } from '@lucide/svelte';

	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import { Card } from '@wharfkit/svelte-components';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import GenericSummary from '$lib/components/summary/generic.svelte';
	import { formatDateTime } from '$lib/utils/intl';
	import type { ActionTraceFiltered } from '$lib/types/transaction';

	interface Props {
		traces: ActionTraceFiltered[];
		showDate?: boolean;
		perspectiveOf?: Name | ((trace: ActionTraceFiltered) => Name | undefined);
		locale?: string;
		class?: string;
	}

	let { traces, showDate = true, perspectiveOf, locale = 'en', class: className }: Props = $props();

	let expandedRows = $state(new Set<string>());
	let overflowingRows = $state(new Set<string>());

	function checkOverflow(node: HTMLElement, rowKey: string) {
		const check = () => {
			if (node.scrollHeight > node.clientHeight + 4) {
				overflowingRows.add(rowKey);
				overflowingRows = new Set(overflowingRows);
			}
		};
		check();
		return { destroy() {} };
	}

	function resolvePerspective(trace: ActionTraceFiltered): Name | undefined {
		if (!perspectiveOf) return undefined;
		if (typeof perspectiveOf === 'function') return perspectiveOf(trace);
		return perspectiveOf;
	}
</script>

<Card class="overflow-hidden p-0 {className || ''}">
	<div
		class="text-on-surface-variant/70 hidden text-xs font-medium tracking-wide uppercase md:flex"
	>
		{#if showDate}
			<div class="w-44 shrink-0 px-4 py-3">Date</div>
		{/if}
		<div class="w-40 shrink-0 px-4 py-3">Action</div>
		<div class="flex-1 px-4 py-3">Details</div>
	</div>
	<div class="divide-outline-variant/40 divide-y">
		{#each traces as trace}
			{@const contract = String(trace.action.account)}
			{@const action = String(trace.action.name)}
			{@const datetime = trace.block_time.toDate()}
			{@const trxId = trace.trx_id}
			{@const rowKey = `${trxId}-${trace.receipt.global_sequence}`}
			{@const isExpanded = expandedRows.has(rowKey)}
			{@const summary = getActionSummaryComponent(contract, action, trace.act.data)}
			{@const perspective = resolvePerspective(trace)}
			<div class="hover:bg-surface-container-high/50 transition-colors">
				<div class="flex flex-col gap-2 p-4 md:flex-row md:items-start md:gap-0">
					{#if showDate}
						<div
							class="flex items-center gap-3 md:w-44 md:shrink-0 md:flex-col md:items-start md:gap-1"
						>
							<div class="text-sm tabular-nums">
								{formatDateTime(datetime, locale, {
									dateStyle: 'short',
									timeStyle: 'short'
								})}
							</div>
							<div class="text-on-surface-variant font-mono text-xs md:block">
								<Transaction id={trxId} />
							</div>
						</div>
					{/if}
					<div
						class="flex items-center gap-2 md:w-40 md:shrink-0 md:flex-col md:items-start md:gap-0.5"
					>
						<span class="text-sm font-medium">
							<Contract name={Name.from(contract)}>
								{contract}
							</Contract>
						</span>
						<span class="text-on-surface-variant text-xs">
							<Contract name={Name.from(contract)} action={Name.from(action)}>
								{action}
							</Contract>
						</span>
					</div>
					<div class="@container min-w-0 flex-1 text-sm md:pl-4">
						<div class="relative">
							<div
								use:checkOverflow={rowKey}
								class="overflow-hidden transition-all {isExpanded ? '' : 'max-h-20'}"
							>
								{#if summary}
									{@const SummaryComponent = summary}
									<SummaryComponent
										action={trace.action}
										data={trace.act.data}
										perspectiveOf={perspective}
									/>
								{:else if trace.act.data}
									<GenericSummary data={trace.act.data} />
								{/if}
							</div>
							{#if overflowingRows.has(rowKey) && !isExpanded}
								<div
									class="from-surface-container-lowest pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent"
								></div>
							{/if}
						</div>
						{#if overflowingRows.has(rowKey) || isExpanded}
							<button
								onclick={() => {
									if (isExpanded) {
										expandedRows.delete(rowKey);
									} else {
										expandedRows.add(rowKey);
									}
									expandedRows = new Set(expandedRows);
								}}
								class="text-primary hover:text-primary/80 hover:bg-primary/10 mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
							>
								<ChevronsUpDownIcon size={14} />
								{isExpanded ? 'Show less' : 'Show more'}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</Card>
