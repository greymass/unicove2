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
		type AccountLeaderboardEntry,
		type AccountSort
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
	let entries = $state<AccountLeaderboardEntry[]>([]);

	const sortOptions: ExtendedSelectOption[] = [
		{ label: 'Actions authorized', value: 'actions_authorized' },
		{ label: 'Actions', value: 'actions' },
		{ label: 'Transactions authorized', value: 'transactions_authorized' },
		{ label: 'Transactions', value: 'transactions' }
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
			sortBy: String(selectedSort.value) as AccountSort,
			excludeSystem
		};
		const id = ++requestId;
		loading = true;
		failed = false;
		client
			.getTopAccounts(params)
			.then((response) => {
				if (id !== requestId) return;
				entries = response.data ?? [];
				loading = false;
			})
			.catch(() => {
				if (id !== requestId) return;
				entries = [];
				loading = false;
				failed = true;
			});
	});

	const locale = $derived(String(data.locale ?? 'en'));
</script>

<Stack class="gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<WindowSelect bind:value={statWindow} />
		<div class="flex flex-wrap items-center gap-6">
			<span class="flex items-center gap-2">
				<Label for="account-sort">Sort by</Label>
				<Select
					id="account-sort"
					options={sortOptions}
					selected={selectedSort}
					onSelectedChange={onSortChange}
				/>
			</span>
			<span class="flex items-center gap-2">
				<Label for="include-system">Include system accounts</Label>
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
		<p class="text-error">Account activity is unavailable right now. Please try again later.</p>
	{:else if loading && !entries.length}
		<p class="text-muted animate-pulse">Loading account activity...</p>
	{:else}
		<Table full>
			{#snippet thead()}
				<TH>#</TH>
				<TH>Account</TH>
				<TH class="text-right">Actions authorized</TH>
				<TH class="text-right">Actions received</TH>
				<TH class="text-right">Transactions</TH>
			{/snippet}
			{#each entries as entry, index (entry.account)}
				<TR>
					<TD class="text-muted">{index + 1}</TD>
					<TD>
						<a class="text-primary" href={context.urlPath(`/account/${entry.account}`)}>
							{entry.account}
						</a>
					</TD>
					<TD class="text-right font-mono tabular-nums"
						>{entry.actions_authorized.toLocaleString(locale)}</TD
					>
					<TD class="text-right font-mono tabular-nums"
						>{entry.actions_received.toLocaleString(locale)}</TD
					>
					<TD class="text-right font-mono tabular-nums"
						>{entry.transactions.toLocaleString(locale)}</TD
					>
				</TR>
			{/each}
		</Table>
		<p class="text-muted text-sm">
			Accounts that sign transactions rank by actions authorized; actions received shows traffic
			arriving at the account instead.
		</p>
	{/if}
</Stack>
