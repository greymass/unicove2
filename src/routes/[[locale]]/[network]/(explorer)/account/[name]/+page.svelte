<script lang="ts">
	import { getContext } from 'svelte';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';

	import { AccountValueState } from '$lib/state/value.svelte.js';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import CurrencySelect from '$lib/components/select/currency.svelte';
	import ResourceCard from '$lib/components/elements/resourceCard.svelte';
	import TokenBalance from '$lib/components/card/tokenbalance.svelte';
	import Tokendistribution from '$lib/components/chart/tokendistribution.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { tokenEquals, ZeroUnits } from '$lib/types/token.js';
	import { ramtoken } from '$lib/wharf/chains.js';
	import { Currencies } from '$lib/types/currencies.js';
	import { getNonSystemTokenBalances } from '$lib/utils/balance.js';
	import SystemTokenSwap from '$lib/components/banner/systemTokenSwap.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const currentAccountValue = $derived(
		new AccountValueState({
			account: data.account,
			network: data.network,
			settings: context.settings,
			market: market.market
		})
	);

	const isCurrentUser = $derived(
		(context.account?.name && data.account.name?.equals(context.account.name)) || false
	);

	const hasValue = $derived(
		data.network.supports('delphioracle') || context.settings.data.mockPrice
	);

	const rambalance = $derived(
		data.account.balances.find((b) => tokenEquals(b.token.id, data.network.getRamToken().id))
	);
	const historicTimeframe = 'day';
	const ramhistoric = $derived(market.market.historic?.ram?.[historicTimeframe]);
	const systemtokenhistoric = $derived(market.market.historic?.systemtoken?.[historicTimeframe]);

	const cpuAvailable = $derived(data.account.resources.cpu.available);
	const netAvailable = $derived(data.account.resources.net.available);

	const legacytoken = data.network.config.legacytoken;
	const legacybalance = $derived(
		legacytoken
			? data.account.balances.find((b) => tokenEquals(b.token.id, legacytoken.id))
			: undefined
	);

	const showAllBalances = false; // TODO: remove this when we have a better way to show all balances
	const currency = Currencies[context.settings.data.displayCurrency];
	const balances = $derived(
		getNonSystemTokenBalances(data.network, market.market, currency, data.account.balances)
	);
</script>

<div class="xs:grid-cols-full grid gap-6 lg:grid-cols-[60%_1fr]">
	<div class="space-y-6">
		{#if hasValue}
			<Card id="account-value" style="column-span: all;">
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
					<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
						<DollarSign />
					</picture>

					{#if currentAccountValue}
						<div class="flex flex-1 flex-col gap-1">
							<p class="leading-none">Total Account Value</p>
							{#if currentAccountValue.hasPrice}
								<AssetText
									class="text-on-surface text-left text-2xl leading-none font-bold"
									variant="full"
									value={currentAccountValue.value}
								/>
							{:else}
								<div
									class="bg-surface-container-high text-on-surface w-48 animate-pulse rounded text-2xl font-bold"
								>
									&nbsp;
								</div>
							{/if}
						</div>
					{/if}

					<div class="flex flex-col gap-1 text-right text-nowrap">
						<CurrencySelect />
					</div>
				</div>
			</Card>
		{/if}

		{#if data.account && data.account.balance}
			<TokenBalance
				balance={data.account.balance}
				child="total"
				cta={data.network.supports('directfunding') &&
				data.network.config.coinbase?.assets.includes(data.account.balance.token.name)
					? [
							{
								text: 'Add Funds',
								href: context.urlPath(`/fund`),
								visible: isCurrentUser
							}
						]
					: undefined}
				{isCurrentUser}
				open
				network={data.network}
				historic={systemtokenhistoric}
				{historicTimeframe}
				pair={currentAccountValue.pair}
				value={currentAccountValue.systemtoken.systemtoken}
			/>
		{/if}

		{#if legacytoken && legacybalance && legacybalance.balance.units.gt(ZeroUnits)}
			<TokenBalance
				balance={legacybalance}
				cta={data.network.supports('directfunding') &&
				data.network.config.coinbase?.assets.includes(legacybalance.balance.symbol.name)
					? [
							{
								text: 'Add Funds',
								href: context.urlPath(`/fund`),
								visible: isCurrentUser
							}
						]
					: undefined}
				{isCurrentUser}
				open
				network={data.network}
				historic={systemtokenhistoric}
				{historicTimeframe}
				pair={currentAccountValue.pair}
				value={currentAccountValue.systemtoken.legacy}
			/>
		{/if}

		{#if rambalance}
			<TokenBalance
				balance={rambalance}
				cta={[
					{
						text: `Swap ${data.network.token.name}/${data.network.getRamToken().name}`,
						href: context.urlPath(`/swap/${data.network.token.id.url}/${ramtoken.id.url}`),
						visible: isCurrentUser
					}
				]}
				child="total"
				{isCurrentUser}
				network={data.network}
				historic={ramhistoric}
				{historicTimeframe}
				pair={market.network.ram}
				value={currentAccountValue.systemtoken.ram}
			/>
		{/if}

		{#if showAllBalances}
			{#each balances as balance}
				{@const pair = market.market.getPair(balance.token.id, currency)}
				{@const value = market.market.value(balance.token.id, currency, balance.balance)}
				<TokenBalance {balance} {isCurrentUser} network={data.network} {pair} {value} />
			{/each}
		{/if}
	</div>
	<div class="space-y-6">
		<Tokendistribution data={currentAccountValue.systemtoken} />
		{#if isCurrentUser}
			<SystemTokenSwap account={data.account} network={data.network} />
		{/if}
		<Card class="@container" title="Resources">
			<Stack>
				<div class="flex gap-12 *:flex-1 @sm:justify-between @sm:*:flex-auto">
					<ResourceCard type="cpu" value={cpuAvailable} vertical />

					<ResourceCard type="net" value={netAvailable} vertical />
				</div>
				{#if isCurrentUser}
					<Button href={context.urlPath(`/resources`)} variant="secondary">Resources</Button>
				{/if}
			</Stack>
		</Card>
	</div>
</div>
