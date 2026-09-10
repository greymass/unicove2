<script lang="ts">
	import { Card, Stack, Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import { TextInput } from '@wharfkit/svelte-components';
	import { Select, type ExtendedSelectOption } from '@wharfkit/svelte-components';
	import {
		ChevronsUpDownIcon,
		ChevronDownIcon,
		ColumnsIcon,
		DatabaseIcon,
		RotateCcwIcon,
		SlidersHorizontalIcon
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import LimitSelect from '$lib/components/filters/LimitSelect.svelte';
	import LoadingBounce from '$lib/components/filters/LoadingBounce.svelte';
	import PaginationControls from '$lib/components/filters/PaginationControls.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import { parseRootType } from '$lib/utils/abi';

	const { urlPath } = getContext<UnicoveContext>('state');

	const { data } = $props();

	const table = $derived(data.abi.tables.find((t) => t.name === data.table));
	const struct = $derived(table && data.abi.structs.find((s) => s.name === table.type));
	const tableRow = $derived(table ? data.abi.structs.find((s) => s.name === table.type) : null);
	const allFieldNames = $derived(struct ? struct.fields.map((f: { name: string }) => f.name) : []);

	let expandedCells = $state(new Set<string>());
	let overflowingCells = $state(new Set<string>());
	let visibleFields = $state(new Set<string>());
	let columnsOpen = $state(false);
	let prevTable = $state('');

	let hiddenCount = $derived(allFieldNames.length - visibleFields.size);

	function checkOverflow(node: HTMLElement, cellKey: string) {
		const check = () => {
			if (node.scrollHeight > node.clientHeight + 4) {
				overflowingCells.add(cellKey);
				overflowingCells = new Set(overflowingCells);
			}
		};
		check();
		return { destroy() {} };
	}

	function formatValue(value: unknown): string {
		if (value === null || value === undefined) return '';
		return String(value);
	}

	const numericTypes = new Set([
		'uint8',
		'uint16',
		'uint32',
		'uint64',
		'uint128',
		'int8',
		'int16',
		'int32',
		'int64',
		'int128',
		'float32',
		'float64',
		'float128',
		'asset',
		'extended_asset'
	]);

	function isRightAligned(type: string): boolean {
		return numericTypes.has(type);
	}

	const fieldTypes = $derived.by(() => {
		const types: Record<string, string> = {};
		if (struct) {
			for (const field of struct.fields) {
				types[field.name] = field.type;
			}
		}
		return types;
	});

	let isLoading = $state(false);
	let rows = $derived(data.rows);
	let from = $state(data.from || '');
	let to = $state(data.to || '');
	let order = $state<'asc' | 'desc'>(data.order || 'asc');
	let scope = $state(data.scope || data.contract);
	let indexPosition = $state(data.index || 'primary');
	let keyType = $state(data.keyType || 'i64');
	let limit = $state(data.limit || 10);

	let advancedOpen = $state(
		(data.index && data.index !== 'primary') || (data.keyType && data.keyType !== 'i64')
	);

	$effect(() => {
		from = data.from || '';
		to = data.to || '';
		order = data.order || 'asc';
		scope = data.scope || String(data.contract);
		indexPosition = data.index || 'primary';
		keyType = data.keyType || 'i64';
		limit = data.limit || 10;
		advancedOpen =
			!!(data.index && data.index !== 'primary') || !!(data.keyType && data.keyType !== 'i64');
		if (data.table !== prevTable) {
			prevTable = data.table;
			visibleFields = new Set(allFieldNames);
			columnsOpen = false;
		}
	});

	let activeAdvancedCount = $derived(
		(indexPosition !== 'primary' ? 1 : 0) +
			(keyType !== 'i64' && indexPosition !== 'primary' ? 1 : 0)
	);

	let hasNext = $derived(!!data.next);

	let queryUnchanged = $derived(
		from === (data.from || '') &&
			to === (data.to || '') &&
			order === (data.order || 'asc') &&
			String(scope) === String(data.scope || data.contract) &&
			indexPosition === (data.index || 'primary') &&
			keyType === (data.keyType || 'i64')
	);

	const orderOptions: ExtendedSelectOption[] = [
		{ label: 'ASC', value: 'asc' },
		{ label: 'DESC', value: 'desc' }
	];

	const indexOptions: ExtendedSelectOption[] = [
		{ label: 'Primary', value: 'primary' },
		{ label: '2nd', value: 'secondary' },
		{ label: '3rd', value: 'tertiary' },
		{ label: '4th', value: 'fourth' },
		{ label: '5th', value: 'fifth' },
		{ label: '6th', value: 'sixth' },
		{ label: '7th', value: 'seventh' },
		{ label: '8th', value: 'eighth' },
		{ label: '9th', value: 'ninth' },
		{ label: '10th', value: 'tenth' }
	];

	const keyTypeOptions: ExtendedSelectOption[] = [
		{ label: 'i64', value: 'i64' },
		{ label: 'i128', value: 'i128' },
		{ label: 'float64', value: 'float64' },
		{ label: 'float128', value: 'float128' },
		{ label: 'name', value: 'name' },
		{ label: 'sha256', value: 'sha256' },
		{ label: 'ripemd160', value: 'ripemd160' }
	];

	let selectedOrder = $derived(orderOptions.find((o) => o.value === order) || orderOptions[0]);
	let selectedIndex = $derived(
		indexOptions.find((o) => o.value === indexPosition) || indexOptions[0]
	);
	let selectedKeyType = $derived(
		keyTypeOptions.find((o) => o.value === keyType) || keyTypeOptions[0]
	);

	function tableUrl(scopeValue: unknown) {
		return urlPath(
			`/${data.network}/contract/${data.contract}/tables/${data.table}/${scopeValue || data.contract}`
		);
	}

	function buildPageUrl() {
		const base = tableUrl(scope);
		const params = new URLSearchParams();
		if (from) params.set('from', from);
		if (to) params.set('to', to);
		if (order === 'desc') params.set('order', 'desc');
		if (indexPosition !== 'primary') params.set('index', indexPosition);
		if (keyType !== 'i64' && indexPosition !== 'primary') params.set('key_type', keyType);
		if (limit !== 10) params.set('limit', String(limit));
		const qs = params.toString();
		return qs ? `${base}?${qs}` : base;
	}

	let firstUrl = $derived(tableUrl(scope));

	let nextUrl = $derived.by(() => {
		const params = new URLSearchParams();
		if (data.next) params.set('from', data.next);
		if (order === 'desc') params.set('order', 'desc');
		if (indexPosition !== 'primary') params.set('index', indexPosition);
		if (keyType !== 'i64' && indexPosition !== 'primary') params.set('key_type', keyType);
		if (limit !== 10) params.set('limit', String(limit));
		const qs = params.toString();
		const base = tableUrl(scope);
		return qs ? `${base}?${qs}` : base;
	});

	async function more() {
		isLoading = true;
		await goto(nextUrl, { noScroll: true });
		isLoading = false;
	}

	async function first() {
		isLoading = true;
		await goto(firstUrl, { noScroll: true });
		isLoading = false;
	}

	async function query(e: SubmitEvent | MouseEvent) {
		e.preventDefault();
		if (indexPosition === 'primary') {
			keyType = 'i64';
		}
		isLoading = true;
		await goto(buildPageUrl(), { keepFocus: true });
		isLoading = false;
	}

	async function reset() {
		scope = data.contract;
		from = '';
		to = '';
		order = 'asc';
		indexPosition = 'primary';
		keyType = 'i64';
		limit = 10;
		advancedOpen = false;
		visibleFields = new Set(allFieldNames);
		columnsOpen = false;
		expandedCells = new Set();
		overflowingCells = new Set();
		isLoading = true;
		await goto(tableUrl(String(data.contract)), {
			keepFocus: true
		});
		isLoading = false;
	}

	async function handleLimitChange(newLimit: number) {
		limit = newLimit;
		isLoading = true;
		await goto(buildPageUrl(), { keepFocus: true });
		isLoading = false;
	}

	function toggleField(name: string) {
		if (visibleFields.has(name)) {
			if (visibleFields.size > 1) {
				visibleFields.delete(name);
				visibleFields = new Set(visibleFields);
			}
		} else {
			visibleFields.add(name);
			visibleFields = new Set(visibleFields);
		}
	}

	function selectAllFields() {
		visibleFields = new Set(allFieldNames);
	}

	function deselectAllFields() {
		if (allFieldNames.length > 0) {
			visibleFields = new Set([allFieldNames[0]]);
		}
	}

	let allSelected = $derived(visibleFields.size === allFieldNames.length);

	let visibleStruct = $derived(
		struct ? struct.fields.filter((f: { name: string }) => visibleFields.has(f.name)) : []
	);
</script>

<Stack>
	<Stack>
		<div>
			<div class="bg-surface-container-high flex flex-col gap-1.5 rounded-t-lg px-4 py-3">
				<div class="flex items-center gap-2">
					<DatabaseIcon size={20} class="text-on-surface-variant" />
					<h2 class="text-headline font-bold">{data.table}</h2>
					{#if tableRow}
						<span class="text-on-surface-variant text-sm">
							<Contract name={data.contract} struct={tableRow.name}>
								{tableRow.name}
							</Contract>
						</span>
					{/if}
				</div>
				{#if data.abi.tables.length > 1}
					<div class="flex flex-wrap gap-1.5 pl-7">
						{#each data.abi.tables as t}
							{@const isCurrent = String(t.name) === data.table}
							<a
								href={urlPath(`/contract/${data.contract}/tables/${t.name}`)}
								class="rounded-md px-2 py-0.5 text-xs font-medium transition-colors {isCurrent
									? 'bg-primary text-on-primary'
									: 'text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-highest'}"
							>
								{t.name}
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<div class="bg-surface-container flex flex-col gap-3 rounded-b-lg px-4 py-3">
				<form
					onsubmit={query}
					class="grid grid-cols-[1fr_1fr] gap-2 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
				>
					<div class="col-span-2 sm:col-span-1">
						<TextInput label="Scope" placeholder={String(data.contract)} bind:value={scope} />
					</div>
					<TextInput label="From" placeholder="Lower bound" bind:value={from} />
					<TextInput label="To" placeholder="Upper bound" bind:value={to} />
					<div class="self-end">
						<Select
							id="order-select"
							variant="form"
							options={orderOptions}
							selected={selectedOrder}
							onSelectedChange={({ next }) => {
								if (next) order = next.value as 'asc' | 'desc';
								return next;
							}}
						/>
					</div>
					<Button onclick={query} class="self-end" disabled={queryUnchanged || isLoading}
						>Query</Button
					>
				</form>

				<div class="flex flex-wrap items-center gap-1">
					<button
						onclick={() => (advancedOpen = !advancedOpen)}
						class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm"
					>
						<SlidersHorizontalIcon size={14} />
						<span>Advanced</span>
						{#if activeAdvancedCount > 0}
							<span
								class="bg-primary text-on-primary inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold sm:h-5 sm:min-w-5 sm:px-1.5 sm:text-xs"
							>
								{activeAdvancedCount}
							</span>
						{/if}
						<ChevronDownIcon
							size={14}
							class="transition-transform duration-200 {advancedOpen ? 'rotate-180' : ''}"
						/>
					</button>

					<button
						onclick={() => (columnsOpen = !columnsOpen)}
						class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm"
					>
						<ColumnsIcon size={14} />
						<span>Columns</span>
						{#if hiddenCount > 0}
							<span
								class="bg-primary text-on-primary inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold sm:h-5 sm:min-w-5 sm:px-1.5 sm:text-xs"
							>
								{hiddenCount}
							</span>
						{/if}
						<ChevronDownIcon
							size={14}
							class="transition-transform duration-200 {columnsOpen ? 'rotate-180' : ''}"
						/>
					</button>

					<button
						onclick={reset}
						class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm"
						title="Reset all controls"
					>
						<RotateCcwIcon size={14} />
						<span>Reset</span>
					</button>

					<div class="ml-auto flex items-center gap-2">
						<LimitSelect value={limit} onChange={handleLimitChange} />
						<PaginationControls
							hasPrev={!!data.from || !!data.lower}
							{hasNext}
							{isLoading}
							prevLabel="First"
							onPrev={first}
							onNext={more}
						/>
					</div>
				</div>

				{#if advancedOpen}
					<div>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<div class="flex flex-col gap-1.5">
								<span class="text-on-surface-variant text-sm font-medium">Index Position</span>
								<Select
									id="index-select"
									options={indexOptions}
									selected={selectedIndex}
									onSelectedChange={({ next }) => {
										if (next) {
											indexPosition = next.value as string;
											if (indexPosition === 'primary') {
												keyType = 'i64';
											}
										}
										return next;
									}}
								/>
							</div>
							<div class="flex flex-col gap-1.5">
								<span class="text-on-surface-variant text-sm font-medium">Key Type</span>
								<Select
									id="key-type-select"
									options={keyTypeOptions}
									selected={selectedKeyType}
									disabled={indexPosition === 'primary'}
									onSelectedChange={({ next }) => {
										if (next) keyType = next.value as string;
										return next;
									}}
								/>
							</div>
						</div>
					</div>
				{/if}

				{#if columnsOpen}
					<div>
						<div class="mb-2 flex items-center gap-2">
							<button
								onclick={selectAllFields}
								disabled={allSelected}
								class="text-xs font-medium transition-colors disabled:opacity-40 {allSelected
									? 'text-on-surface-variant'
									: 'text-primary hover:text-primary/80'}"
							>
								Select all
							</button>
							<span class="text-outline-variant text-xs">|</span>
							<button
								onclick={deselectAllFields}
								disabled={visibleFields.size <= 1}
								class="text-xs font-medium transition-colors disabled:opacity-40 {visibleFields.size <=
								1
									? 'text-on-surface-variant'
									: 'text-primary hover:text-primary/80'}"
							>
								Deselect all
							</button>
							<span class="text-on-surface-variant ml-auto text-xs"
								>{visibleFields.size}/{allFieldNames.length}</span
							>
						</div>
						<div class="flex flex-col">
							{#each struct ? struct.fields : [] as field}
								{@const fieldType = data.abi.structs.find(
									(s) => s.name === parseRootType(field.type)
								)}
								<label
									class="border-outline/10 hover:bg-surface-container-high flex cursor-pointer items-center gap-3 border-b px-1 py-1.5 last:border-b-0"
								>
									<input
										type="checkbox"
										checked={visibleFields.has(field.name)}
										onchange={() => toggleField(field.name)}
										class="accent-primary h-3.5 w-3.5"
									/>
									<span class="text-on-surface font-mono text-sm">{field.name}</span>
									<span class="text-on-surface-variant text-xs">
										{#if fieldType}
											<Contract name={data.contract} struct={fieldType.name}>
												{field.type}
											</Contract>
										{:else}
											{field.type}
										{/if}
									</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		{#if data.error}
			<div class="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-sm">
				{data.error}
			</div>
		{/if}

		<Card class="bg-surface-container relative overflow-x-auto p-0">
			<Table full class="border-outline/30 border-separate border-spacing-0">
				{#snippet thead()}
					{#each visibleStruct as field}
						<TH
							class="bg-primary/8 text-on-surface border-b-primary/40 border-r-outline/20 border-r border-b-2 py-3 pr-3 pl-3 font-mono text-xs font-semibold tracking-wide first:pl-4 last:border-r-0 last:pr-4 {isRightAligned(
								field.type
							)
								? 'text-right'
								: 'text-left'}"
						>
							{field.name}
						</TH>
					{/each}
				{/snippet}

				{#if rows.length === 0}
					<tr>
						<td colspan={visibleStruct.length} class="text-on-surface-variant py-8 pl-4 text-sm">
							No data found for the current query parameters.
						</td>
					</tr>
				{/if}
				{#each rows as row, rowIndex}
					<TR background>
						{#each Object.keys(row) as key}
							{#if visibleFields.has(key)}
								{@const value = row[key]}
								{@const isComplex = typeof value === 'object' && value !== null}
								{@const cellKey = `${rowIndex}-${key}`}
								{@const isExpanded = expandedCells.has(cellKey)}
								{@const rightAlign = isRightAligned(fieldTypes[key] || '')}
								<TD
									class="border-outline/20 border-r py-2 pr-3 pl-3 align-top first:pl-4 last:border-r-0 last:pr-4 {rightAlign
										? 'text-right'
										: ''}"
								>
									{#if isComplex}
										<div class="relative">
											<div
												use:checkOverflow={cellKey}
												class="overflow-hidden transition-all {isExpanded ? '' : 'max-h-20'}"
											>
												<Code class="p-2 text-xs">
													{JSON.stringify(value, null, 2)}
												</Code>
											</div>
											{#if overflowingCells.has(cellKey) && !isExpanded}
												<div
													class="from-surface-container pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent"
												></div>
											{/if}
										</div>
										{#if overflowingCells.has(cellKey) || isExpanded}
											<button
												onclick={() => {
													if (isExpanded) {
														expandedCells.delete(cellKey);
													} else {
														expandedCells.add(cellKey);
													}
													expandedCells = new Set(expandedCells);
												}}
												class="text-primary hover:text-primary/80 hover:bg-primary/10 mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
											>
												<ChevronsUpDownIcon size={14} />
												{isExpanded ? 'Show less' : 'Show more'}
											</button>
										{/if}
									{:else}
										<span
											class="font-mono text-sm whitespace-nowrap {rightAlign ? 'tabular-nums' : ''}"
										>
											{formatValue(value)}
										</span>
									{/if}
								</TD>
							{/if}
						{/each}
					</TR>
				{/each}
			</Table>
			{#if isLoading}
				<div class="bg-surface-container/80 absolute inset-0 flex items-center justify-center">
					<LoadingBounce class="py-8" />
				</div>
			{/if}
		</Card>

		{#if hasNext}
			<div class="flex justify-center gap-4">
				<Button onclick={first} variant="secondary" disabled={!data.from && !data.lower}
					>First Page</Button
				>
				<Button onclick={more}>Next Page</Button>
			</div>
		{/if}
	</Stack>
</Stack>
