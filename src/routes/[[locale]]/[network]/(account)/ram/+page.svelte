<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';

	import { calculateValue } from '$lib/utils';
	import { MultiCard } from '$lib/components/layout';
	import { Stack } from '@wharfkit/svelte-components';
	import { AssetInput } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { BytesInput } from '@wharfkit/svelte-components';
	import { Card } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import type { SystemResources } from '$lib/types/network';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import AccountBalance from '$lib/components/card/accountbalance.svelte';

	import { RAMCalculatorState } from './state.svelte';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';
	import SystemTokenSwap from '$lib/components/banner/systemTokenSwap.svelte';
	import About from '$lib/components/seo/about.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const resources: SystemResources = $derived(data.network.resources);

	const totalRamSupply = $derived(
		Asset.fromUnits(resources.ram.supply.value / 1000 / 1000, '3,GB')
	);

	let marketCapToken = $derived(
		Asset.from(
			(resources.ram.price.rammarket.value / 1000) * resources.ram.supply.value,
			data.network.chain.systemToken?.symbol || '0, UNKNOWN'
		)
	);
	let marketCapFiat = $derived(calculateValue(marketCapToken, market.network.systemtoken.price));

	let ramLiquid = $derived(
		Asset.from(Number(context.account?.resources.ram.balance || 0) / 1000, '3,KB')
	);

	const balanceValueToken = $derived(calculateValue(ramLiquid, resources.ram.price.rammarket));
	const balanceValueFiat = $derived(
		calculateValue(balanceValueToken, market.network.systemtoken.price)
	);
	const kbValueToken = $derived(resources.ram.price.rammarket);
	const kbValueFiat = $derived(calculateValue(kbValueToken, market.network.systemtoken.price));

	const ramCalculatorState = new RAMCalculatorState(data.network.chain);

	$effect(() => {
		if (resources.ram.price.rammarket) {
			ramCalculatorState.pricePerKB = resources.ram.price.rammarket;
		}
	});

	function setAssetAmount() {
		ramCalculatorState.setAssetAmount(ramCalculatorState.tokens);
	}

	function setBytesAmount() {
		ramCalculatorState.setBytesAmount(ramCalculatorState.bytes || 0);
		assetInput?.set(ramCalculatorState.bytesValue);
	}

	let assetInput: AssetInput;
	let bytesInput: BytesInput;
</script>

<MultiCard>
	{#snippet leftColumn()}
		<!-- Buy Sell Card -->
		<Card class="flex gap-4 *:flex-1">
			<div class="grid content-between gap-4">
				<div>
					<h3 class="text-muted text-base">RAM Available</h3>
					<AssetText class=" text-xl font-semibold" variant="full" value={ramLiquid} />
				</div>

				<Button variant="secondary" href={context.urlPath('/ram/buy')}>Buy</Button>
			</div>

			<div class="grid content-between gap-4">
				<div>
					<h3 class="text-muted text-base">
						{balanceValueToken.symbol.name} Value
					</h3>
					<AssetText class=" text-xl font-semibold" variant="full" value={balanceValueToken} />
					<div>
						<AssetText class="text-muted  text-base" variant="full" value={balanceValueFiat} />
					</div>
				</div>
				<Button variant="secondary" href={context.urlPath('/ram/sell')}>Sell</Button>
			</div>
		</Card>

		<AccountBalance />
		<SystemTokenSwap account={context.account} network={data.network} />

		<!-- RAM Calculator -->

		<Card title="RAM Calculator">
			<Stack>
				<div class="flex gap-4 *:flex-1">
					<Stack class="gap-2">
						<Label for="asset-amount" class="leading-none">
							{data.network.chain.systemToken?.symbol.code || ''}
						</Label>
						<AssetInput
							id="asset-amount"
							bind:value={ramCalculatorState.tokens}
							bind:this={assetInput}
							oninput={setAssetAmount}
						/>
					</Stack>

					<Stack class="gap-2">
						<Label for="bytes-amount" class="leading-none">Bytes</Label>
						<BytesInput
							id="bytes-amount"
							bind:value={ramCalculatorState.bytes}
							bind:this={bytesInput}
							oninput={setBytesAmount}
						/>
					</Stack>
				</div>

				<Stack class="gap-2">
					<h4 class="text-md font-semibold">Details</h4>
					<DL>
						<DLRow title={` ${data.network.token.id.symbol.code || ''}/RAM (KB) `}>
							<DD>
								<AssetText variant="full" value={kbValueToken} />
							</DD>
						</DLRow>
						<DLRow title={` ${market.network.currency.symbol.code}/RAM (KB) `}>
							<DD>
								<AssetText variant="full" value={kbValueFiat} />
							</DD>
						</DLRow>
						<DLRow title={`${market.network.currency.symbol.code} Price`}>
							<DD>
								<AssetText
									variant="full"
									value={calculateValue(
										ramCalculatorState.tokens,
										market.network.systemtoken.price
									)}
								/>
							</DD>
						</DLRow>
						<DLRow title="Network Fees">
							<DD>
								<AssetText variant="full" value={ramCalculatorState.fee} />
							</DD>
						</DLRow>
					</DL>
				</Stack>
			</Stack>
		</Card>
	{/snippet}

	{#snippet rightColumn()}
		{#if data.historicalPrices.length}
			<div class="">
				<RamPriceHistory />
			</div>
		{/if}

		<Card>
			<DL>
				<DLRow title={`Market Cap (${data.network.chain.systemToken?.symbol.code || ''})`}>
					<DD>
						<AssetText variant="full" value={marketCapToken} />
					</DD>
				</DLRow>
				<DLRow title={`Market Cap (${market.network.currency.symbol.code})`}>
					<DD>
						<AssetText variant="full" value={marketCapFiat} />
					</DD>
				</DLRow>
				<DLRow title="Supply">
					<DD>
						<AssetText variant="full" value={totalRamSupply} />
					</DD>
				</DLRow>
			</DL>
		</Card>
	{/snippet}
</MultiCard>

<About title="About RAM on {data.network.chain.name}">
	<p>
		RAM is the on-chain storage of the {data.network.chain.name} network. Every account, token balance,
		and smart contract table occupies RAM, and an account must hold enough of it to store the data its
		actions create.
	</p>
	<p>
		RAM is bought from and sold back to a system-managed market whose price moves with demand, so it
		trades like a token and is measured in kilobytes. This page shows the current price per
		kilobyte, the market capitalization, and the total supply, and lets a signed-in account buy or
		sell RAM directly from the market. The calculator converts between token amounts and bytes at
		the current price.
	</p>
</About>
