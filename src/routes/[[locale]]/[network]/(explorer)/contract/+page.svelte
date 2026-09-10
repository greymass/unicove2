<script lang="ts">
	import { getContext } from 'svelte';
	import {
		Label,
		Select,
		Stack,
		Switch,
		Table,
		TD,
		TH,
		TR,
		type ExtendedSelectOption
	} from '@wharfkit/svelte-components';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import {
		StatindexClient,
		type ContractLeaderboardEntry,
		type ContractSort,
		type StatPeriod
	} from '$lib/state/statindex/client';
	import { DEFAULT_STAT_WINDOW, windowStart, type StatWindow } from '$lib/state/statindex/utils';
	import WindowSelect from '$lib/components/statindex/windowselect.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const client = new StatindexClient(context.urlPath('/api/stats'));

	let statWindow = $state<StatWindow>(DEFAULT_STAT_WINDOW);
	let excludeSystem = $state(true);
	let loading = $state(true);
	let failed = $state(false);
	let entries = $state<ContractLeaderboardEntry[]>([]);
	let period = $state<StatPeriod | undefined>();

	const sortOptions: ExtendedSelectOption[] = [
		{ label: 'Actions', value: 'actions' },
		{ label: 'Unique callers', value: 'unique_callers' },
		{ label: 'New callers', value: 'new_callers' }
	];
	let selectedSort = $state<ExtendedSelectOption>(sortOptions[0]);

	function onSortChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next) selectedSort = next;
		return next;
	}

	let requestId = 0;

	$effect(() => {
		const params = {
			start: windowStart(statWindow),
			limit: 100,
			sortBy: String(selectedSort.value) as ContractSort,
			excludeSystem
		};
		const id = ++requestId;
		loading = true;
		failed = false;
		client
			.getTopContracts(params)
			.then((response) => {
				if (id !== requestId) return;
				entries = response.data ?? [];
				period = response.period;
				loading = false;
			})
			.catch(() => {
				if (id !== requestId) return;
				entries = [];
				period = undefined;
				loading = false;
				failed = true;
			});
	});

	const locale = $derived(String(data.locale ?? 'en'));

	function share(actions: number): string {
		if (!period || !period.total_actions) return '';
		return `${((actions / period.total_actions) * 100).toFixed(2)}%`;
	}
</script>

<Stack class="gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<WindowSelect bind:value={statWindow} />
		<div class="flex flex-wrap items-center gap-6">
			<span class="flex items-center gap-2">
				<Label for="contract-sort">Sort by</Label>
				<Select
					id="contract-sort"
					options={sortOptions}
					selected={selectedSort}
					onSelectedChange={onSortChange}
				/>
			</span>
			<span class="flex items-center gap-2">
				<Label for="include-system">Include system contracts</Label>
				<Switch
					id="include-system"
					checked={!excludeSystem}
					onCheckedChange={({ next }) => {
						excludeSystem = !next;
						return next;
					}}
				/>
			</span>
		</div>
	</div>

	{#if failed}
		<p class="text-error">Contract activity is unavailable right now. Please try again later.</p>
	{:else if loading && !entries.length}
		<p class="text-muted animate-pulse">Loading contract activity...</p>
	{:else}
		<Table full>
			{#snippet thead()}
				<TH>#</TH>
				<TH>Contract</TH>
				<TH class="text-right">Actions</TH>
				<TH class="text-right">Unique callers</TH>
				<TH class="text-right">New callers</TH>
				<TH class="text-right">Share of network</TH>
			{/snippet}
			{#each entries as entry, index (entry.contract)}
				<TR>
					<TD class="text-muted">{index + 1}</TD>
					<TD>
						<a class="text-primary" href={context.urlPath(`/account/${entry.contract}`)}>
							{entry.contract}
						</a>
					</TD>
					<TD class="text-right font-mono tabular-nums">{entry.actions.toLocaleString(locale)}</TD>
					<TD class="text-right font-mono tabular-nums"
						>≈{entry.unique_callers.toLocaleString(locale)}</TD
					>
					<TD class="text-right font-mono tabular-nums"
						>≈{entry.new_callers.toLocaleString(locale)}</TD
					>
					<TD class="text-right font-mono tabular-nums">{share(entry.actions)}</TD>
				</TR>
			{/each}
		</Table>
		<p class="text-muted text-sm">
			Unique counts are approximate. Activity is counted for any account receiving actions, so
			regular accounts may occasionally appear.
		</p>
	{/if}
</Stack>
