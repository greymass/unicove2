<script lang="ts">
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import { Card, Number, Table, TH, TR, TD } from '@wharfkit/svelte-components';

	let { data } = $props();

	const ramDeltas = $derived(
		data.transaction.traces.filter((trace) => trace.account_ram_deltas.length)
	);
</script>

<div class="p-2">
	<h2 class="text-headline text-2xl">RAM Usage</h2>
	<p>The deltas in RAM usage for each trace in the transaction.</p>
</div>

<Card>
	<Table full>
		{#snippet thead()}
			<TH class="text-right">Bytes</TH>
			<TH>Owner</TH>
			<TH class="text-right">Contract</TH>
			<TH>Action</TH>
		{/snippet}

		{#each ramDeltas as trace}
			{#each trace.account_ram_deltas as delta}
				<TR>
					<TD class="text-right font-mono font-bold">
						<Number delta number={delta.delta} colored />
					</TD>
					<TD>
						<Account name={delta.account} />
					</TD>
					<TD class="text-right">
						<Contract name={trace.act.account} />
					</TD>
					<TD>
						<Contract name={trace.act.account} action={trace.act.name}>
							{trace.act.name}
						</Contract>
					</TD>
				</TR>
			{/each}
		{/each}
	</Table>
</Card>
