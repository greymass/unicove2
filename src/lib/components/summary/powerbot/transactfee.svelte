<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';
	import { ArrowBigRight, NotebookText } from '@lucide/svelte';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import SuspiciousMemo from '$lib/components/elements/suspiciousmemo.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			provider: NameType;
			funder: NameType;
			beneficiary: NameType;
			fee: AssetType;
			memo: string;
		};
	}

	const { data, perspectiveOf }: Props = $props();

	const isFunder = $derived(perspectiveOf && perspectiveOf.equals(data.funder));
</script>

<Row>
	<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
		{#if isFunder}
			<Chip class="bg-error-container text-on-error-container">Paid fee</Chip>
		{:else}
			<Chip>Service fee</Chip>
		{/if}

		<AssetElement class="font-medium" value={Asset.from(data.fee)} variant="full" />

		<span class="inline-flex items-center gap-1.5">
			<AccountLink name={Name.from(data.funder)} />
			<ArrowBigRight class="text-on-surface-variant size-4 shrink-0" />
			<AccountLink name={Name.from(data.provider)} />
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="text-on-surface-variant">for</span>
			<AccountLink name={Name.from(data.beneficiary)} />
		</span>

		{#if data.memo}
			<span class="text-on-surface-variant inline-flex items-start gap-1">
				<NotebookText class="mt-0.5 size-3.5 shrink-0" />
				<SuspiciousMemo memo={data.memo} />
			</span>
		{/if}
	</span>
</Row>
