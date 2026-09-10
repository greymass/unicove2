<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			funder: NameType;
			quantity: AssetType;
		};
	}

	const { data }: Props = $props();
</script>

<Row>
	<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
		<Chip>Withdraw</Chip>
		<AccountLink name={Name.from(data.funder)} />
		<span class="text-on-surface-variant">withdrew</span>
		<AssetElement class="font-medium" value={Asset.from(data.quantity)} variant="full" />
		<span class="text-on-surface-variant">from pool balance</span>
	</span>
</Row>
