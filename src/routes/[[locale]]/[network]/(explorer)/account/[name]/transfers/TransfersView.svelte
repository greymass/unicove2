<script lang="ts">
	import { onMount } from 'svelte';
	import { Asset, Name } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { TransfersPaginator } from '../transfers.svelte.js';
	import {
		Button,
		Card,
		Label,
		Stack,
		NameInput,
		Select,
		type ExtendedSelectOption
	} from '@wharfkit/svelte-components';
	import PaginationControls from '$lib/components/filters/PaginationControls.svelte';
	import FilterToggleButton from '$lib/components/filters/FilterToggleButton.svelte';
	import ClearFiltersButton from '$lib/components/filters/ClearFiltersButton.svelte';
	import DateRangeInputs from '$lib/components/filters/DateRangeInputs.svelte';
	import SortOrderSelect from '$lib/components/filters/SortOrderSelect.svelte';
	import LimitSelect from '$lib/components/filters/LimitSelect.svelte';
	import LoadingBounce from '$lib/components/filters/LoadingBounce.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import SuspiciousMemo from '$lib/components/elements/suspiciousmemo.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import { formatDateTime } from '$lib/utils/intl';

	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();

	const networkName = String(data.network);
	const systemTokenContract = String(data.network.token.contract);
	const systemTokenSymbol = String(data.network.token.symbol);
	const legacyTokenContract = data.network.legacy ? String(data.network.legacy.id.contract) : null;
	const legacyTokenSymbol = data.network.legacy ? String(data.network.legacy.symbol) : null;

	function getDefaultContract(): string {
		const hasSystemTokenBalance = data.account.balances.some(
			(b) =>
				String(b.token.id.contract) === systemTokenContract &&
				String(b.token.symbol) === systemTokenSymbol &&
				Number(b.balance.value) > 0
		);

		if (hasSystemTokenBalance) {
			return systemTokenContract;
		}

		const hasLegacyTokenBalance =
			legacyTokenContract &&
			legacyTokenSymbol &&
			data.account.balances.some(
				(b) =>
					String(b.token.id.contract) === legacyTokenContract &&
					String(b.token.symbol) === legacyTokenSymbol &&
					Number(b.balance.value) > 0
			);

		if (hasLegacyTokenBalance) {
			return legacyTokenContract;
		}

		const firstWithBalance = data.account.balances.find((b) => Number(b.balance.value) > 0);
		if (firstWithBalance) {
			return String(firstWithBalance.token.id.contract);
		}

		return systemTokenContract;
	}

	const defaultContract = getDefaultContract();

	function getUrlParams() {
		const params = page.url.searchParams;
		const limitParam = params.get('limit');
		return {
			contract: params.get('contract') || defaultContract,
			startDate: params.get('start_date') || '',
			endDate: params.get('end_date') || '',
			order: (params.get('order') as 'asc' | 'desc') || 'desc',
			limit: limitParam ? parseInt(limitParam, 10) : 20,
			cursor: params.get('cursor') || ''
		};
	}

	function updateUrl(options: Record<string, string | number>) {
		const url = new URL(page.url);
		const defaults: Record<string, string | number> = {
			order: 'desc',
			limit: 20,
			contract: defaultContract
		};
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

	let paginator: TransfersPaginator | undefined = $state();

	onMount(() => {
		const urlParams = getUrlParams();

		contractFilter = urlParams.contract;
		contractInput?.set(urlParams.contract);
		if (urlParams.startDate) startDateFilter = urlParams.startDate;
		if (urlParams.endDate) endDateFilter = urlParams.endDate;
		if (urlParams.order) orderFilter = urlParams.order;
		if (urlParams.limit) limitFilter = urlParams.limit;

		if (urlParams.startDate || urlParams.endDate || urlParams.order !== 'desc') {
			filtersOpen = true;
		}

		paginator = new TransfersPaginator(networkName, data.network.fetch, urlParams.contract);
		paginator.setAccount(String(data.name));
		paginator.setDateRange(urlParams.startDate, urlParams.endDate);
		paginator.setOrder(urlParams.order);
		paginator.setLimit(urlParams.limit);
		paginator.load(urlParams.cursor);
	});

	const transfers = $derived(paginator?.page.results ?? []);
	const isLoading = $derived(paginator?.page.isLoading && !transfers.length);
	const hasNext = $derived(paginator?.page.hasNext ?? false);
	const hasPrev = $derived(paginator?.page.hasPrev ?? false);
	const pageIsLoading = $derived(paginator?.page.isLoading ?? false);
	const perspectiveOf = $derived(Name.from(data.name));

	function clickNext() {
		if (!paginator) return;
		const nextCursor = paginator.page.nextCursor;
		paginator.loadNext();
		scrollToTop();

		updateUrl({
			contract: contractFilter,
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: nextCursor || ''
		});
	}

	function clickPrev() {
		if (!paginator) return;
		const prevCursor = paginator.page.prevCursor;
		paginator.loadPrev();
		scrollToTop();

		updateUrl({
			contract: contractFilter,
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: prevCursor || ''
		});
	}

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
	let contractFilter = $state(defaultContract);

	let startDateFilter = $state('');
	let endDateFilter = $state('');
	let orderFilter = $state<'asc' | 'desc'>('desc');
	let limitFilter = $state<number>(20);

	const ramTokenSymbol = data.network.getRamToken().symbol.name;

	const knownTokens: ExtendedSelectOption[] = $derived.by(() => {
		const tokens: ExtendedSelectOption[] = data.account.balances
			.filter((b) => Number(b.balance.value) > 0 && b.token.name !== ramTokenSymbol)
			.map((b) => ({
				label: b.token.name,
				value: String(b.token.id.contract)
			}));

		if (tokens.length === 0) {
			tokens.push({ label: String(data.network.token.symbol.name), value: systemTokenContract });
		}

		return tokens;
	});

	const selectedToken = $derived(
		knownTokens.find((o) => o.value === contractFilter) || {
			label: contractFilter,
			value: contractFilter
		}
	);

	const activeFilterCount = $derived.by(() => {
		let count = 0;
		if (startDateFilter || endDateFilter) count++;
		if (orderFilter !== 'desc') count++;
		return count;
	});

	const hasFilters = $derived(
		contractFilter !== defaultContract || startDateFilter || endDateFilter || orderFilter !== 'desc'
	);

	function applyFilters() {
		if (!paginator) return;

		paginator.page.reset();
		paginator.setContract(contractFilter);
		paginator.setDateRange(startDateFilter, endDateFilter);
		paginator.setOrder(orderFilter);
		paginator.setLimit(limitFilter);
		paginator.load();

		if (activeFilterCount === 0) {
			filtersOpen = false;
		}

		updateUrl({
			contract: contractFilter,
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: ''
		});
	}

	function reset() {
		if (!paginator) return;

		contractFilter = defaultContract;
		contractInput?.set(defaultContract);
		startDateFilter = '';
		endDateFilter = '';
		orderFilter = 'desc';
		limitFilter = 20;

		paginator.page.reset();
		paginator.setContract(defaultContract);
		paginator.setDateRange('', '');
		paginator.setOrder('desc');
		paginator.setLimit(20);
		paginator.load();

		updateUrl({
			contract: defaultContract,
			startDate: '',
			endDate: '',
			order: 'desc',
			limit: 20,
			cursor: ''
		});
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			applyFilters();
		}
	}

	function handleLimitChange(newLimit: number) {
		if (!paginator || newLimit === limitFilter) return;
		limitFilter = newLimit;
		paginator.page.reset();
		paginator.setLimit(limitFilter);
		paginator.load();

		updateUrl({
			contract: contractFilter,
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

	function handleTokenChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (!paginator) return next;
		if (next && next.value !== contractFilter) {
			contractFilter = next.value as string;
			contractInput?.set(contractFilter);
			paginator.page.reset();
			paginator.setContract(contractFilter);
			paginator.load();

			updateUrl({
				contract: contractFilter,
				startDate: startDateFilter,
				endDate: endDateFilter,
				order: orderFilter,
				limit: limitFilter,
				cursor: ''
			});
		}
		return next;
	}
</script>

<Stack class="py-4">
	<div
		bind:this={controlBarEl}
		class="bg-surface-container-low border-outline-variant flex flex-col gap-3 rounded-xl border p-3"
	>
		<div class="flex flex-wrap items-center gap-3">
			<Select
				id="token-select"
				options={knownTokens}
				selected={selectedToken}
				onSelectedChange={handleTokenChange}
			/>

			<div class="flex items-center gap-2">
				<FilterToggleButton
					isOpen={filtersOpen}
					activeCount={activeFilterCount}
					onToggle={() => (filtersOpen = !filtersOpen)}
				/>
				{#if hasFilters}
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
		</div>

		{#if filtersOpen}
			<div class="border-outline-variant border-t pt-3">
				<div class="grid gap-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div class="flex flex-col gap-1.5">
							<Label for="contract-input">Contract</Label>
							<NameInput
								bind:this={contractInput}
								bind:value={contractFilter}
								id="contract-input"
								placeholder="e.g. eosio.token"
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
						<Button class="h-9" onclick={applyFilters}>Apply Filters</Button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if isLoading}
		<LoadingBounce />
	{:else if !transfers.length}
		<div class="flex items-center justify-center py-20">
			<p class="text-center text-gray-400">
				{#if hasFilters}
					No transfers found matching the filter criteria.
				{:else}
					No transfers found for this account.
				{/if}
			</p>
		</div>
	{:else}
		<Card class="overflow-hidden p-0">
			<div
				class="divide-outline-variant/40 grid grid-cols-[auto_1fr_auto] divide-y p-3 md:block md:p-4"
			>
				<div
					class="text-on-surface-variant/70 col-span-full grid grid-cols-subgrid gap-x-2 px-3 py-2 text-xs font-medium tracking-wide uppercase md:flex md:gap-0 md:p-0"
				>
					<div class="flex justify-end md:w-36 md:shrink-0 md:px-4 md:py-3">Date</div>
					<div class="md:w-32 md:shrink-0 md:px-4 md:py-3">Counterparty</div>
					<div class="flex justify-end md:w-44 md:shrink-0 md:px-4 md:py-3">Amount</div>
					<div class="hidden flex-1 md:block md:px-4 md:py-3">Memo</div>
				</div>
				{#each transfers as transfer}
					{@const transferData = transfer.trace.act.data as {
						from: string;
						to: string;
						quantity: string;
						memo?: string;
					}}
					{@const isSend = perspectiveOf.equals(transferData.from)}
					{@const counterparty = isSend ? transferData.to : transferData.from}
					{@const datetime = transfer.trace.block_time.toDate()}

					<div
						class="hover:bg-surface-container-high/50 col-span-full grid grid-cols-subgrid items-center gap-x-2 px-3 py-2 text-sm transition-colors md:flex md:gap-0 md:p-0"
					>
						<div
							class="flex justify-end whitespace-nowrap tabular-nums md:w-36 md:shrink-0 md:px-4 md:py-3"
						>
							<Transaction id={transfer.trace.trx_id}>
								{formatDateTime(datetime, data.locale || 'en', {
									dateStyle: 'short',
									timeStyle: 'short'
								})}
							</Transaction>
						</div>

						<div class="md:w-32 md:shrink-0 md:px-4 md:py-3">
							<AccountLink name={Name.from(counterparty)} />
						</div>

						<div
							class="flex justify-end font-mono whitespace-nowrap tabular-nums md:w-44 md:shrink-0 md:px-4 md:py-3 {isSend
								? 'text-error'
								: 'text-success'}"
						>
							{isSend ? '-' : '+'}
							<AssetElement value={Asset.from(transferData.quantity)} variant="full" />
						</div>

						{#if transferData.memo}
							<div
								class="text-on-surface-variant col-span-full min-w-0 text-right text-xs md:flex-1 md:px-4 md:py-3 md:text-left md:text-sm"
							>
								<SuspiciousMemo memo={transferData.memo} />
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</Card>

		{#if hasPrev || hasNext}
			<div class="flex justify-center gap-4">
				<Button onclick={clickPrev} disabled={!hasPrev || pageIsLoading}>← Prev</Button>
				<Button onclick={clickNext} disabled={!hasNext || pageIsLoading}>Next →</Button>
			</div>
		{/if}
	{/if}
</Stack>
