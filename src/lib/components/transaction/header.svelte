<script lang="ts">
	import type { TransactionResponse } from '$lib/types/transaction';
	import Block from '$lib/components/elements/block.svelte';
	import Contract from '../elements/contract.svelte';
	import { Number } from '@wharfkit/svelte-components';
	import { DateTime } from '@wharfkit/svelte-components';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';

	interface TransactionHeaderProps {
		transaction: TransactionResponse;
	}

	const { transaction }: TransactionHeaderProps = $props();
</script>

<DL>
	<DLRow
		title="Finality Status"
		description={transaction.irreversible ? 'Irreversible' : 'Reversible'}
	></DLRow>
	<DLRow title="Date">
		<DD>
			<DateTime datetime={transaction.block_time.toDate()} />
		</DD>
	</DLRow>
	<DLRow title="Transaction ID" description={transaction.id.toString()}></DLRow>
	<DLRow title="Included in Block">
		<DD>
			<Block number={transaction.block_num} />
		</DD>
	</DLRow>
	<DLRow title="Contracts Used">
		<DD class="flex flex-wrap justify-end gap-4">
			{#each transaction.contracts as contract}
				<Contract name={contract} />
			{/each}
		</DD>
	</DLRow>
	<DLRow title="CPU (μs)">
		<DD>
			<Number number={transaction.trx.receipt.cpu_usage_us} />
		</DD>
	</DLRow>
	<DLRow title="NET (Bytes)">
		<DD>
			<Number number={transaction.trx.receipt.net_usage_words.multiplying(8)} />
		</DD>
	</DLRow>
</DL>
