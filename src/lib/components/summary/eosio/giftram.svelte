<script lang="ts">
	import type { Int64Type, NameType } from '@wharfkit/antelope';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import Transfer from '$lib/components/summary/components/transfer.svelte';
	import { ramtoken } from '$lib/wharf/chains';
	import { Asset } from '@wharfkit/session';

	// giftram differs by contract: eosio uses to/bytes, core.vaulta uses receiver/ram_bytes
	interface GiftRamData {
		from: NameType;
		to?: NameType;
		receiver?: NameType;
		bytes?: Int64Type;
		ram_bytes?: Int64Type;
		memo: string;
	}

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: GiftRamData;
	}

	const { data, perspectiveOf, ...props }: Props = $props();

	const to = $derived(data.receiver ?? data.to ?? '');
	const bytes = $derived(data.ram_bytes ?? data.bytes ?? 0);
</script>

<Transfer
	from={data.from}
	{to}
	quantity={Asset.fromUnits(bytes, ramtoken.symbol)}
	memo={data.memo}
	{perspectiveOf}
	{...props}
/>
