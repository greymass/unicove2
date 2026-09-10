<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Name } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ActivityPaginator } from './state.v2.svelte.js';
	import ActivityControlBar from './ActivityControlBar.svelte';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import { Button, Label, Stack, NameInput } from '@wharfkit/svelte-components';
	import PaginationControls from '$lib/components/filters/PaginationControls.svelte';
	import FilterToggleButton from '$lib/components/filters/FilterToggleButton.svelte';
	import ClearFiltersButton from '$lib/components/filters/ClearFiltersButton.svelte';
	import DateRangeInputs from '$lib/components/filters/DateRangeInputs.svelte';
	import SortOrderSelect from '$lib/components/filters/SortOrderSelect.svelte';
	import LimitSelect from '$lib/components/filters/LimitSelect.svelte';
	import LoadingBounce from '$lib/components/filters/LoadingBounce.svelte';
	import Trace from '$lib/components/elements/trace.svelte';
	import ActionTable from '$lib/components/elements/actiontable.svelte';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	import type { PageData } from './$types';

	interface Props {
		data: PageData;
		onError?: () => void;
	}

	const { data, onError }: Props = $props();

	const networkName = String(data.network);
	const context = getContext<UnicoveContext>('state');

	function getUrlParams() {
		const params = page.url.searchParams;
		const limitParam = params.get('limit');
		return {
			contract: params.get('contract') || '',
			action: params.get('action') || '',
			startDate: params.get('start_date') || '',
			endDate: params.get('end_date') || '',
			order: (params.get('order') as 'asc' | 'desc') || 'desc',
			limit: limitParam ? parseInt(limitParam, 10) : 20,
			cursor: params.get('cursor') || ''
		};
	}

	function updateUrl(options: Record<string, string | number>) {
		const url = new URL(page.url);
		const defaults: Record<string, string | number> = { order: 'desc', limit: 20 };
		const keyMap: Record<string, string> = { startDate: 'start_date', endDate: 'end_date' };

		for (const [key, value] of Object.entries(options)) {
			const paramKey = keyMap[key] || key;
			if (value && value !== defaults[key]) {
				url.searchParams.set(paramKey, String(value));
			} else {
				url.searchParams.delete(paramKey);
			}
		}
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	onMount(() => {
		const urlParams = getUrlParams();

		if (urlParams.contract) {
			contractFilter = Name.from(urlParams.contract);
			contractInput?.set(urlParams.contract);
			contractValid = true;
		}
		if (urlParams.action) {
			actionFilter = Name.from(urlParams.action);
			actionInput?.set(urlParams.action);
			actionValid = true;
		}
		if (urlParams.startDate) startDateFilter = urlParams.startDate;
		if (urlParams.endDate) endDateFilter = urlParams.endDate;
		if (urlParams.order) orderFilter = urlParams.order;
		if (urlParams.limit) limitFilter = urlParams.limit;

		if (
			urlParams.contract ||
			urlParams.action ||
			urlParams.startDate ||
			urlParams.endDate ||
			urlParams.order !== 'desc'
		) {
			filtersOpen = true;
		}

		const loader = ActivityPaginator.getInst(networkName, data.network.fetch);
		loader.setAccount(String(data.name));
		loader.setContract(urlParams.contract);
		loader.setAction(urlParams.action);

		if (urlParams.startDate && urlParams.endDate && urlParams.startDate === urlParams.endDate) {
			loader.setDate(urlParams.startDate);
			loader.setDateRange('', '');
		} else {
			loader.setDate('');
			loader.setDateRange(urlParams.startDate, urlParams.endDate);
		}

		loader.setOrder(urlParams.order);
		loader.setLimit(urlParams.limit);
		loader.load(urlParams.cursor);
	});

	const activityPaginator = $derived(ActivityPaginator.getInst(networkName, data.network.fetch));

	const isLoading = $derived(
		activityPaginator.page.isLoading && !activityPaginator.page.results.length
	);
	const hasNext = $derived(activityPaginator.page.hasNext);
	const hasPrev = $derived(activityPaginator.page.hasPrev);
	const pageIsLoading = $derived(activityPaginator.page.isLoading);
	const activityActions = $derived([...activityPaginator.page.results]);

	$effect(() => {
		if (activityPaginator.page.error && onError) {
			onError();
		}
	});

	function clickNext() {
		const nextCursor = activityPaginator.page.nextCursor;
		activityPaginator.loadNext();
		scrollToTop();

		updateUrl({
			contract: String(contractFilter),
			action: String(actionFilter),
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: nextCursor || ''
		});
	}

	function clickPrev() {
		const prevCursor = activityPaginator.page.prevCursor;
		activityPaginator.loadPrev();
		scrollToTop();

		updateUrl({
			contract: String(contractFilter),
			action: String(actionFilter),
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: prevCursor || ''
		});
	}

	let variant: ActionDisplayVariants = $derived(
		(context.settings.data.actionDisplayVariant as ActionDisplayVariants) || 'table'
	);

	let controlBarEl: HTMLElement | undefined = $state();

	function scrollToTop() {
		const shouldScroll = window.scrollY > 100;
		if (!shouldScroll) return;
		setTimeout(() => {
			if (!controlBarEl) return;
			const rect = controlBarEl.getBoundingClientRect();
			const targetY = window.scrollY + rect.top;
			window.scrollTo({ top: targetY, behavior: 'smooth' });
		}, 50);
	}

	let filtersOpen = $state(false);

	let contractInput: NameInput | undefined = $state();
	let contractValid = $state(false);
	let contractFilter = $state(Name.from(''));

	let actionInput: NameInput | undefined = $state();
	let actionValid = $state(false);
	let actionFilter = $state(Name.from(''));

	let startDateFilter = $state('');
	let endDateFilter = $state('');
	let orderFilter = $state<'asc' | 'desc'>('desc');
	let limitFilter = $state<number>(20);

	const activeFilterCount = $derived.by(() => {
		let count = 0;
		if (contractValid && !contractFilter.equals(Name.from(''))) count++;
		if (actionValid && !actionFilter.equals(Name.from(''))) count++;
		if (startDateFilter || endDateFilter) count++;
		if (orderFilter !== 'desc') count++;
		return count;
	});

	const filterable = $derived(
		contractValid || startDateFilter || endDateFilter || orderFilter !== 'desc'
	);

	function filter() {
		activityPaginator.page.reset();
		activityPaginator.setAccount(String(data.name));
		activityPaginator.setContract(String(contractFilter));
		activityPaginator.setAction(String(actionFilter));

		if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
			activityPaginator.setDate(startDateFilter);
			activityPaginator.setDateRange('', '');
		} else {
			activityPaginator.setDate('');
			activityPaginator.setDateRange(startDateFilter, endDateFilter);
		}

		activityPaginator.setOrder(orderFilter);
		activityPaginator.setLimit(limitFilter);
		activityPaginator.load();

		if (activeFilterCount === 0) {
			filtersOpen = false;
		}

		updateUrl({
			contract: String(contractFilter),
			action: String(actionFilter),
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: ''
		});
	}

	function reset() {
		contractFilter = Name.from('');
		contractInput?.set('');
		actionFilter = Name.from('');
		actionInput?.set('');
		startDateFilter = '';
		endDateFilter = '';
		orderFilter = 'desc';
		limitFilter = 20;
		activityPaginator.page.reset();
		activityPaginator.setAccount(String(data.name));
		activityPaginator.setContract('');
		activityPaginator.setAction('');
		activityPaginator.setDate('');
		activityPaginator.setDateRange('', '');
		activityPaginator.setOrder('desc');
		activityPaginator.setLimit(20);
		activityPaginator.load();

		updateUrl({
			contract: '',
			action: '',
			startDate: '',
			endDate: '',
			order: 'desc',
			limit: 20,
			cursor: ''
		});
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && filterable) {
			filter();
		}
	}

	function handleLimitChange(newLimit: number) {
		if (newLimit === limitFilter) return;
		limitFilter = newLimit;
		activityPaginator.page.reset();
		activityPaginator.setLimit(limitFilter);
		activityPaginator.load();

		updateUrl({
			contract: String(contractFilter),
			action: String(actionFilter),
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: ''
		});
	}

	function handleOrderChange(newOrder: 'asc' | 'desc') {
		orderFilter = newOrder;
	}
</script>

<Stack class="py-4">
	<ActivityControlBar bind:controlBarEl>
		{#snippet controls()}
			<div class="flex items-center gap-2">
				<FilterToggleButton
					isOpen={filtersOpen}
					activeCount={activeFilterCount}
					onToggle={() => (filtersOpen = !filtersOpen)}
				/>
				{#if activityPaginator?.filtering}
					<ClearFiltersButton onClear={reset} />
				{/if}
			</div>

			<div class="ml-auto flex items-center gap-2">
				<LimitSelect value={limitFilter} onChange={handleLimitChange} />
				<PaginationControls
					{hasPrev}
					{hasNext}
					isLoading={pageIsLoading}
					onPrev={clickPrev}
					onNext={clickNext}
				/>
			</div>
		{/snippet}

		{#snippet filterPanel()}
			{#if filtersOpen}
				<div class="border-outline-variant border-t pt-3">
					<div class="grid gap-4">
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
							<div class="flex flex-col gap-1.5">
								<Label for="contract-input">Contract</Label>
								<NameInput
									bind:this={contractInput}
									bind:value={contractFilter}
									bind:valid={contractValid}
									id="contract-input"
									placeholder="e.g. eosio.token"
									onkeypress={handleKeyPress}
								/>
							</div>
							<div class="flex flex-col gap-1.5">
								<Label for="action-input">Action</Label>
								<NameInput
									bind:this={actionInput}
									bind:value={actionFilter}
									bind:valid={actionValid}
									id="action-input"
									placeholder="e.g. transfer"
									onkeypress={handleKeyPress}
								/>
							</div>
							<DateRangeInputs
								bind:startDate={startDateFilter}
								bind:endDate={endDateFilter}
								onKeyPress={handleKeyPress}
							/>
							<SortOrderSelect value={orderFilter} onChange={handleOrderChange} />
						</div>

						<div class="flex items-center justify-end gap-2">
							<Button variant="secondary" class="h-9" onclick={reset}>Reset</Button>
							<Button class="h-9" onclick={filter} disabled={!filterable}>Apply Filters</Button>
						</div>
					</div>
				</div>
			{/if}
		{/snippet}
	</ActivityControlBar>

	{#if isLoading}
		<LoadingBounce />
	{:else if !activityActions.length}
		<div class="flex items-center justify-center py-20">
			<p class="text-center text-gray-400">
				{#if activityPaginator?.filtering}
					No actions found matching the filter criteria.
				{:else}
					No activity found for this account.
				{/if}
			</p>
		</div>
	{:else}
		{#if variant === 'table'}
			<ActionTable
				traces={activityActions.map((a) => a.trace)}
				perspectiveOf={Name.from(data.name)}
				locale={data.locale || 'en'}
			/>
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
		{#if hasPrev || hasNext}
			<div class="flex justify-center gap-4">
				<Button onclick={clickPrev} disabled={!hasPrev || pageIsLoading}>← Prev</Button>
				<Button onclick={clickNext} disabled={!hasNext || pageIsLoading}>Next →</Button>
			</div>
		{/if}
	{/if}
</Stack>
