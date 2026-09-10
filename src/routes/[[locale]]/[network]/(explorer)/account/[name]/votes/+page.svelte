<script lang="ts">
	import AccountText from '$lib/components/elements/account.svelte';
	import VoteWeight from '$lib/components/elements/voteweight.svelte';
	import { Float64 } from '@wharfkit/antelope';
	import { Table, TD, TH, TR } from '@wharfkit/svelte-components';

	const { data } = $props();
</script>

<Table>
	<TR>
		<TD>Proxied To</TD>
		<TD class="text-right">
			<AccountText name={data.account.voter.proxy} />
		</TD>
	</TR>
	<TR>
		<TD>Is Proxy?</TD>
		<TD class="text-right">
			{#if data.account.voter.isProxy}
				Yes
			{:else}
				No
			{/if}
		</TD>
	</TR>
	<TR>
		<TD>Total Vote Weight</TD>
		<TD class="text-right">
			<VoteWeight weight={data.account.voter.weight} variant="full" />
		</TD>
	</TR>
	<TR>
		<TD>Self Vote Weight</TD>
		<TD class="text-right">
			<VoteWeight
				weight={Float64.from(
					Number(data.account.voter.weight) - Number(data.account.voter.proxyWeight)
				)}
				variant="full"
			/>
		</TD>
	</TR>
	<TR>
		<TD>Proxied Weight</TD>
		<TD class="text-right">
			<VoteWeight weight={data.account.voter.proxyWeight} variant="full" />
		</TD>
	</TR>
</Table>

{#if data.account.voter.votes.length}
	<Table>
		{#snippet thead()}
			<TH>Block Producer</TH>
		{/snippet}

		{#each data.account.voter.votes as vote}
			<TR>
				<TD>
					<AccountText name={vote} />
				</TD>
			</TR>
		{/each}
	</Table>
{/if}
