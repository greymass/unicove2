<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';

	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { TokenBalanceValue, ZeroUnits } from '$lib/types/token.js';
	import { Button, Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import { Currencies } from '$lib/types/currencies.js';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const currency = Currencies[context.settings.data.displayCurrency];

	const balances = $derived(
		data.account.balances
			.filter((item) => item.balance.units.gt(ZeroUnits))
			.map((item) => {
				const pair = market.market.getPair(item.token.id, currency);
				if (pair) {
					return TokenBalanceValue.from({
						...item,
						token: {
							...item.token,
							// Merge media from token and pair
							media: {
								...item.token.media,
								...pair.base.media
							}
						},
						value: market.market.value(item.token.id, currency, item.balance)
					});
				} else {
					return TokenBalanceValue.from({
						...item,
						value: Asset.fromUnits(0, currency.symbol)
					});
				}
			})
			.sort((a, b) => (a.value.units.gt(b.value.units) ? -1 : 1))
	);

	const isCurrentUser = $derived(
		context.account &&
			context.account.name &&
			data.account &&
			data.account.name &&
			data.account.name.equals(context.account.name)
	);
</script>

{#snippet tableAction(asset: Asset)}
	<TD class="text-right">
		<Button variant="text" href={context.urlPath(`/send?quantity=${asset}`)}>Send</Button>
	</TD>
{/snippet}

{#if balances.length}
	<Table>
		{#snippet thead()}
			<TH>Token</TH>
			<TH class="text-right">Amount</TH>
			<TH class="text-right">Value ({context.settings.data.displayCurrency})</TH>
			{#if isCurrentUser}
				<TH></TH>
			{/if}
		{/snippet}

		{#each balances as tokenBalance}
			<TR>
				<TD>
					<div class="flex items-center gap-3">
						<picture class="size-5">
							{#if tokenBalance.token.media?.logo?.dark}
								<img
									class="size-full object-contain"
									src={tokenBalance.token.media?.logo?.dark}
									alt={`${tokenBalance.token.name} Logo`}
								/>
							{:else}
								<div class="bg-surface-container size-5 rounded-full"></div>
							{/if}
						</picture>
						<a
							href={context.urlPath(
								`/token/${tokenBalance.token.contract}/${tokenBalance.token.name}`
							)}
						>
							{tokenBalance.token.name}
						</a>
					</div>
				</TD>
				<TD class="text-right">
					<AssetText value={tokenBalance.balance} />
				</TD>
				<TD class="text-right">
					{#if tokenBalance.value.units.gt(ZeroUnits)}
						<AssetText value={tokenBalance.value} />
					{/if}
				</TD>
				{#if isCurrentUser}
					{#if !tokenBalance.locked}
						{@render tableAction(tokenBalance.balance)}
					{/if}
				{/if}
			</TR>
		{/each}
	</Table>
{:else}
	<p>No balances found.</p>
{/if}
