<script lang="ts">
	import { Button, Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import Account from '$lib/components/elements/account.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
</script>

<Table>
	<TR>
		<TD>Total Accounts Holding</TD>
		<TD class="text-right">
			{data.numholders.toLocaleString()}
		</TD>
	</TR>
	<TR>
		<TD>Supply</TD>
		<TD class="text-right">
			<AssetText value={data.stats.supply} />
		</TD>
	</TR>
	<TR>
		<TD>Max Supply</TD>
		<TD class="text-right">
			<AssetText value={data.stats.max_supply} />
		</TD>
	</TR>
	<TR>
		<TD>Issuer</TD>
		<TD class="text-right">
			<Account name={data.stats.issuer} />
		</TD>
	</TR>
</Table>

{#if data.topholders.length}
	<h2 class="text-on-surface text-2xl font-semibold">Top 100 Accounts</h2>
	<Table>
		{#snippet thead()}
			<TH>#</TH>
			<TH>Account</TH>
			<TH class="text-right">Balance</TH>
		{/snippet}

		{#each data.topholders as holder, idx}
			<TR>
				<TD>{idx + 1}</TD>
				<TD>
					<Account name={holder.account}>
						{#if data.network.config.lockedsupply?.find((locked) => holder.account.equals(locked))}
							{holder.account} <span class="text-muted">(Locked Supply)</span>
						{:else}
							{holder.account}
						{/if}
					</Account>
				</TD>
				<TD class="text-right">
					<AssetText value={holder.balance} />
				</TD>
			</TR>
		{/each}
	</Table>

	{#if data.loadMoreUrl}
		<Button href={data.loadMoreUrl} data-sveltekit-noscroll data-sveltekit-replacestate
			>Load more</Button
		>
	{/if}
{/if}

{#if context.settings.data.debugMode}
	<Code>
		{JSON.stringify(data, null, 2)}
	</Code>
{/if}
