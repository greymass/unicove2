<script lang="ts">
	import { Name } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Clock from '@lucide/svelte/icons/clock';

	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import ActionTable from '$lib/components/elements/actiontable.svelte';
	import AccountElement from '$lib/components/elements/account.svelte';
	import Block from '$lib/components/elements/block.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import { Card, Stack, Number } from '@wharfkit/svelte-components';

	let { data } = $props();

	const { urlPath } = getContext<UnicoveContext>('state');

	let urlBase = $derived.by(() => {
		let base = urlPath(`/transaction/${data.id}`);
		if (data.seq) base += `/${data.seq}`;
		return base;
	});

	let signers = $derived.by(() => {
		const actors = new Set<string>();
		for (const action of data.transaction.transaction.actions) {
			for (const auth of action.authorization) {
				actors.add(String(auth.actor));
			}
		}
		return [...actors].map((a) => Name.from(a));
	});

	let ramDeltas = $derived.by(() => {
		return data.transaction.traces
			.filter((trace) => trace.account_ram_deltas.length)
			.flatMap((trace) => trace.account_ram_deltas);
	});

	let netRamChange = $derived(ramDeltas.reduce((sum, d) => sum + +d.delta, 0));
</script>

<Stack class="@container gap-5">
	<div class="grid grid-cols-2 gap-3 @lg:grid-cols-4">
		<div class="bg-surface-container-low col-span-2 rounded-xl p-4 @lg:col-span-1">
			<p class="text-on-surface-variant mb-1.5 text-xs font-medium tracking-wider uppercase">
				Block
			</p>
			<div class="flex items-center gap-2">
				<p class="text-sm font-semibold">
					<Block number={data.transaction.block_num} />
				</p>
				{#if data.transaction.irreversible}
					<div
						class="bg-success-container text-on-success-container inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
					>
						<ShieldCheck class="size-3" />
						Irreversible
					</div>
				{:else}
					<div
						class="bg-surface-container-high text-on-surface-variant inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
					>
						<Clock class="size-3" />
						Pending
					</div>
				{/if}
			</div>
		</div>
		<div class="bg-surface-container-low rounded-xl p-4">
			<p class="text-on-surface-variant mb-1.5 text-xs font-medium tracking-wider uppercase">CPU</p>
			<p class="text-sm">
				<span class="text-on-surface font-semibold"
					><Number number={data.transaction.trx.receipt.cpu_usage_us} /></span
				>
				<span class="text-on-surface-variant">&micro;s</span>
			</p>
		</div>
		<div class="bg-surface-container-low rounded-xl p-4">
			<p class="text-on-surface-variant mb-1.5 text-xs font-medium tracking-wider uppercase">NET</p>
			<p class="text-sm">
				<span class="text-on-surface font-semibold"
					><Number number={data.transaction.trx.receipt.net_usage_words.multiplying(8)} /></span
				>
				<span class="text-on-surface-variant">bytes</span>
			</p>
		</div>
		{#if ramDeltas.length > 0}
			<div class="bg-surface-container-low rounded-xl p-4">
				<p class="text-on-surface-variant mb-1.5 text-xs font-medium tracking-wider uppercase">
					RAM
				</p>
				<p class="text-sm">
					{#if netRamChange > 0}
						<span class="text-on-surface font-semibold"><Number number={netRamChange} /></span>
						<span class="text-on-surface-variant">bytes used</span>
					{:else if netRamChange < 0}
						<span class="text-on-surface font-semibold"
							><Number number={Math.abs(netRamChange)} /></span
						>
						<span class="text-on-surface-variant">bytes freed</span>
					{:else}
						<span class="text-on-surface-variant">no net change</span>
					{/if}
				</p>
			</div>
		{/if}
	</div>
	<div class="-mt-2 flex justify-end">
		<a
			href={`${urlBase}/details`}
			class="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-sm"
		>
			All transaction details
			<ChevronRight class="size-3.5" />
		</a>
	</div>

	<Card class="overflow-hidden p-0">
		<div class="flex items-center justify-between px-5 pt-4 pb-1">
			<h2 class="text-title">Actions ({data.transaction.filtered.length})</h2>
			<a
				href={`${urlBase}/actions`}
				class="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-sm"
			>
				Inspect data
				<ChevronRight class="size-3.5" />
			</a>
		</div>
		<ActionTable
			traces={data.transaction.filtered}
			showDate={false}
			perspectiveOf={(trace) => trace.action.authorization[0]?.actor}
		/>
	</Card>

	<div class="grid gap-5 @xl:grid-cols-2">
		<Card class="p-4">
			<h3
				class="text-label text-on-surface-variant pb-3 text-sm font-medium tracking-wide uppercase"
			>
				Signers
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each signers as signer}
					<AccountElement
						name={signer}
						class="bg-surface-container-high hover:bg-surface-container-highest rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
					/>
				{/each}
			</div>
			{#if data.transaction.contracts.length > 0}
				<h3
					class="text-label text-on-surface-variant mt-4 pb-3 text-sm font-medium tracking-wide uppercase"
				>
					Contracts
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each data.transaction.contracts as contract}
						<Contract
							name={contract}
							class="bg-surface-container-high hover:bg-surface-container-highest rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
						/>
					{/each}
				</div>
			{/if}
		</Card>

		<Card class="p-4">
			<h3
				class="text-label text-on-surface-variant pb-3 text-sm font-medium tracking-wide uppercase"
			>
				Raw Data
			</h3>
			<div class="grid grid-cols-2 gap-3">
				<div class="bg-surface-container-high rounded-lg p-3">
					<p class="text-on-surface-variant text-xs">Signatures</p>
					<p class="text-on-surface text-lg font-semibold">
						{data.transaction.signedTransaction.signatures.length}
					</p>
				</div>
				<div class="bg-surface-container-high rounded-lg p-3">
					<p class="text-on-surface-variant text-xs">Traces</p>
					<p class="text-on-surface text-lg font-semibold">{data.transaction.traces.length}</p>
				</div>
			</div>
			<div class="flex justify-end pt-2">
				<a
					href={`${urlBase}/transaction`}
					class="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 text-sm"
				>
					View raw data
					<ChevronRight class="size-3.5" />
				</a>
			</div>
		</Card>
	</div>
</Stack>
