<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { Types as RAMTypes } from '$lib/types/ram';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { ramtoken } from '$lib/wharf/chains';
	import { PUBLIC_SYSTEM_CONTRACT } from '$env/static/public';
	import Transfer from '$lib/components/summary/components/transfer.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: RAMTypes.logbuyram;
	}

	const { data, ...props }: Props = $props();
</script>

<Transfer from={data.payer} to={PUBLIC_SYSTEM_CONTRACT} quantity={data.quantity} {...props} />

<Transfer
	from={PUBLIC_SYSTEM_CONTRACT}
	to={data.receiver}
	quantity={Asset.fromUnits(data.bytes, ramtoken.symbol)}
	{...props}
/>

{#if data.fee}
	<Transfer from={PUBLIC_SYSTEM_CONTRACT} to={'eosio.fees'} quantity={data.fee} {...props} />
{/if}
