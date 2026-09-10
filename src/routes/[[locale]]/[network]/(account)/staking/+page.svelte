<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { ChartLine } from '@lucide/svelte';

	import { MultiCard } from '$lib/components/layout';
	import { Button, Card, Stack, Table, TD, TR } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import {
		getClaimableBalance,
		getWithdrawableBalance,
		getStakedBalance,
		getUnstakingBalances,
		getAPR,
		getUnstakableBalance,
		getUnstakableREX,
		getUnstakingRex
	} from '$lib/utils/staking';
	import UnstakingBalances from '$lib/components/elements/unstaking.svelte';
	import AccountBalance from '$lib/components/card/accountbalance.svelte';
	import StakingCalculator from './stakingcalculator.svelte';
	import { Cluster } from '@wharfkit/svelte-components';
	import { Chip } from '@wharfkit/svelte-components';
	import { Currencies } from '$lib/types/currencies';
	import { ZeroUnits } from '$lib/types/token';
	import SystemTokenSwap from '$lib/components/banner/systemTokenSwap.svelte';
	import About from '$lib/components/seo/about.svelte';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const { data } = $props();

	let total: Asset = $derived(getStakedBalance(data.network, context.account));
	let staked: Asset = $derived(getUnstakableBalance(data.network, context.account));
	let stakedRex: Asset = $derived(getUnstakableREX(data.network, context.account));
	let unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(data.network, context.account)
	);
	let unstakingRex: Asset = $derived(getUnstakingRex(data.network, context.account));
	let unstakingTotal: Asset = $derived(
		unstaking
			.filter((r) => !r.savings)
			.reduce(
				(acc, record) => {
					if (!record.claimable) {
						acc.units.add(record.balance.units);
					}
					return acc;
				},
				Asset.fromUnits(0, data.network.chain.systemToken!.symbol) as Asset
			)
	);
	let claimable: Asset = $derived(getClaimableBalance(data.network, context.account, unstaking));
	let withdrawable: Asset = $derived(getWithdrawableBalance(data.network, context.account));
	let totalWithdraw: Asset = $derived(
		Asset.fromUnits(
			claimable.units.adding(withdrawable.units),
			data.network.chain.systemToken!.symbol
		)
	);

	let apr = $derived(getAPR(data.network.token.distribution?.staked));

	let activity = $derived(
		staked.units.gt(ZeroUnits) ||
			unstakingTotal.units.gt(ZeroUnits) ||
			totalWithdraw.units.gt(ZeroUnits)
	);

	const currency = $derived(Currencies[context.settings.data.displayCurrency]);
	let currencyValue = $derived(
		market.account ? market.account.systemtoken.staked : Asset.fromUnits(0, currency.symbol)
	);
</script>

{#snippet tableAction([text, href]: string[])}
	<TD class="text-right">
		<Button variant="text" {href}>{text}</Button>
	</TD>
{/snippet}

{#if data.network.supports('staking')}
	<MultiCard>
		<Card id="account-value" style="column-span: all;">
			<Cluster class="items-center">
				<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
					<ChartLine />
				</picture>
				<div>
					<p>Current APR</p>
					<p class="text-on-surface text-2xl font-bold">{apr}%</p>
				</div>
			</Cluster>
		</Card>

		{#snippet leftColumn()}
			<Card id="token" title="Staking Balance">
				<Stack>
					<Stack class="gap-2">
						<h4 class="text-muted text-base leading-none capitalize">tokens Staked</h4>

						<AssetText
							class="text-on-surface text-xl leading-none font-semibold"
							variant="full"
							value={total}
						/>

						<Chip>
							<AssetText variant="full" value={currencyValue} />
							<!-- TODO: Percent change -->
						</Chip>
					</Stack>

					{#if activity}
						<Table>
							{#if staked.units.gt(ZeroUnits)}
								<TR>
									<TD>Staked</TD>
									<TD class="text-on-surface grid text-right">
										{#if staked.units.equals(0)}
											<span class="font-mono">&lt;</span>
										{/if}
										<AssetText variant="full" value={staked} />
										<AssetText variant="full" value={stakedRex} />
									</TD>
									{@render tableAction(['Unstake', `/${data.network}/staking/unstake`])}
								</TR>
							{/if}
							{#if unstakingTotal.units.gt(ZeroUnits)}
								<TR>
									<TD>Unstaking</TD>
									<TD class="text-on-surface grid text-right">
										<AssetText variant="full" value={unstakingTotal} />
										<AssetText variant="full" value={unstakingRex} />
									</TD>
									<TD></TD>
								</TR>
							{/if}
							{#if totalWithdraw.units.gt(ZeroUnits)}
								<TR>
									<TD>Unstaked</TD>
									<TD class="text-on-surface grid text-right">
										<AssetText variant="full" value={totalWithdraw} />
										<AssetText variant="full" value={unstakingRex} />
									</TD>
									{@render tableAction(['Withdraw', `/${data.network}/staking/withdraw`])}
								</TR>
							{/if}
						</Table>
					{/if}
				</Stack>
			</Card>
			<AccountBalance cta={{ href: context.urlPath(`/staking/stake`), label: 'Stake' }} />
			<SystemTokenSwap account={context.account} network={data.network} />
		{/snippet}

		{#snippet rightColumn()}
			<UnstakingBalances records={unstaking} />
			<StakingCalculator
				{apr}
				network={data.network}
				tokenprice={market.network.systemtoken.price}
			/>
		{/snippet}
	</MultiCard>
{:else}
	<p>This staking interface is not available on {data.network.chain.name}.</p>
{/if}

<About title="About staking on {data.network.chain.name}">
	<p>
		Staking locks {data.network.chain.systemToken?.symbol.name} tokens in the {data.network.chain
			.name} system contract in exchange for a share of the network's staking rewards. Rewards are distributed
		continuously in proportion to each account's staked balance, and the rate shown as APR changes as
		the total amount staked changes.
	</p>
	<p>
		Staked tokens can be unstaked at any time. They then pass through a lockup period before they
		can be withdrawn back to a liquid balance. Unicove lets you stake, unstake, and withdraw from
		this page with any {data.network.chain.name} compatible wallet, and shows the balance held in each
		stage for the signed-in account.
	</p>
</About>
