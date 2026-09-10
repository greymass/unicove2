<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';
	import { NotebookText } from '@lucide/svelte';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import SuspiciousMemo from '$lib/components/elements/suspiciousmemo.svelte';
	import Container from '../components/container.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			funder: NameType;
			beneficiary: NameType;
			chain_cost: AssetType;
			provider_fee: AssetType;
			cpu_ms: number;
			net_kb: number;
			memo: string;
		};
	}

	const { data, perspectiveOf }: Props = $props();

	const isFunder = $derived(perspectiveOf && perspectiveOf.equals(data.funder));
	const isBeneficiary = $derived(perspectiveOf && perspectiveOf.equals(data.beneficiary));
	const memo = $derived(data.memo === 'powerbot watcher topup' ? '' : data.memo);
</script>

<Container>
	<Row>
		<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
			{#if isFunder}
				<Chip class="bg-error-container text-on-error-container">Paid</Chip>
			{:else if isBeneficiary}
				<Chip class="bg-success-container text-on-success-container">Received resources</Chip>
			{:else}
				<Chip>Topped up</Chip>
			{/if}

			<AccountLink name={Name.from(data.beneficiary)} />

			<span class="text-on-surface-variant text-sm"
				>{data.cpu_ms} ms CPU / {data.net_kb} kB NET</span
			>
		</span>
	</Row>
	<Row>
		<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
			<span class="inline-flex items-center gap-1">
				<span class="text-on-surface-variant">cost</span>
				<AssetElement class="font-medium" value={Asset.from(data.chain_cost)} variant="full" />
				<span class="text-on-surface-variant">+</span>
				<AssetElement class="font-medium" value={Asset.from(data.provider_fee)} variant="full" />
				<span class="text-on-surface-variant">fee</span>
			</span>

			<span class="inline-flex items-center gap-1">
				<span class="text-on-surface-variant">funded by</span>
				<AccountLink name={Name.from(data.funder)} />
			</span>
		</span>
	</Row>
	{#if memo}
		<Row>
			<span class="text-on-surface-variant inline-flex items-start gap-1">
				<NotebookText class="mt-0.5 size-3.5 shrink-0" />
				<SuspiciousMemo {memo} />
			</span>
		</Row>
	{/if}
</Container>
