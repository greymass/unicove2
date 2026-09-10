<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { ramtoken } from '$lib/wharf/chains';
	import Row from '../components/row.svelte';
	import { Chip } from '@wharfkit/svelte-components';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.buyrambytes;
	}

	const { data }: Props = $props();
</script>

<Row>
	<div class="flex items-center gap-2">
		<Chip>Requesting</Chip>
		<AssetElement value={Asset.fromUnits(data.bytes, ramtoken.symbol)} variant="full" />
	</div>

	<AccountElement name={Name.from(data.payer)} />

	{#if !Name.from(data.receiver).equals(data.payer)}
		<span>
			(Receiver: <AccountElement name={Name.from(data.receiver)} />)
		</span>
	{/if}
</Row>
