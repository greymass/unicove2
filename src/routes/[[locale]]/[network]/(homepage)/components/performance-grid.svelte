<script lang="ts">
	import { Card } from '@wharfkit/svelte-components';
	import type { NetworkState } from '$lib/state/network.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { calculateValue } from '$lib/utils';
	import TextBlock from './text-block.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { Asset, Int64 } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { Currencies } from '$lib/types/currencies';
	import type { NetworkValueState } from '$lib/state/value.svelte';
	import { ramtoken } from '$lib/wharf/chains';

	interface Props {
		network: NetworkState;
		networkName: string;
		networkLogo: string;
	}

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	function calculateTvl(network: NetworkState, networkValue: NetworkValueState): Asset {
		const token = Asset.fromUnits(0, network.token.symbol);
		if (network.supports('rex') && network.token.distribution) {
			token.units.add(network.token.distribution.staked.units);
		}
		if (network.supports('rammarket')) {
			token.units.add(network.resources.ram.supply);
		}
		if (networkValue.systemtoken.price.units.gt(Int64.from(0))) {
			return calculateValue(token, networkValue.systemtoken.price);
		}
		return token;
	}

	let { network, networkLogo, networkName }: Props = $props();

	const tvl = $derived(calculateTvl(network, market.network));
	const circulating = $derived.by(() => {
		if (network.token && network.token.distribution) {
			return network.legacy && network.legacy.distribution
				? Asset.fromUnits(
						network.token.distribution.circulating.units.adding(
							network.legacy.distribution.circulating.units
						),
						network.token.symbol
					)
				: network.token.distribution.circulating;
		}
		return Asset.fromUnits(0, network.token.symbol);
	});
	const marketcap = $derived(
		network.token.distribution
			? calculateValue(circulating, market.network.systemtoken.price)
			: Asset.fromUnits(0, Currencies[context.settings.data.displayCurrency].symbol)
	);
</script>

<section class="@container grid grid-cols-2 items-start gap-x-4 gap-y-12">
	<!-- Text -->
	<div class="col-span-full row-start-1 grid items-center text-balance @3xl:col-span-1">
		<TextBlock
			title="{networkName} Network DeFi"
			text="System-level DeFi is offered by the {networkName} network both staking and RAM trading. The network also supports a variety of DeFi applications, including decentralized exchanges, lending platforms, swaps, and more."
		/>
	</div>

	<!-- Grid -->
	<div
		class="@3xl:col-span-auto @container col-span-full row-start-2 grid content-start gap-4 @3xl:col-start-2 @3xl:row-start-1"
	>
		<div id="performance-row-1" class="grid gap-4 @lg:grid-cols-[1fr_auto_1fr]">
			<!-- Market Cap -->
			<Card class="bg-surface-container-high grid content-between gap-4">
				<h3 class="text-muted text-sm">{network.token.name} Market Cap</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={marketcap} variant="short" />
				</p>
			</Card>

			<!-- Network logo -->
			<img
				class="order-first max-h-24 w-auto justify-self-center object-contain @lg:order-none"
				src={networkLogo}
				alt={networkName}
				loading="lazy"
				width="200"
				height="200"
			/>

			<!-- Native TVL -->
			<Card class="bg-surface-container-highest grid content-between gap-4">
				<h3 class="text-muted text-sm">Native TVL</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={tvl} variant="short" />
				</p>
			</Card>
		</div>

		<div id="performance-row-2" class="grid gap-4 @lg:grid-cols-3">
			<!-- Token price -->
			<Card class="grid flex-1 content-between gap-4 @sm:shrink">
				<h3 class="text-muted text-sm">
					{network.token.symbol.name}/{market.network.systemtoken.price.symbol.name}
				</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={market.network.systemtoken.price} variant="full" />
				</p>
			</Card>

			<!-- Ram Eos pair -->
			<Card class="bg-surface-container-highest grid flex-1 content-between  gap-4">
				<h3 class="text-muted text-sm">{ramtoken.name}/{network.token.symbol.name}</h3>
				<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
					<AssetText value={network.resources.ram.price.rammarket} variant="short" />
				</p>
			</Card>

			<!-- Ram price -->
			{#if network.resources && network.resources.ram.price.rammarket}
				<Card class="bg-surface-container-high grid flex-1 content-between gap-4">
					<h3 class="text-muted text-sm">{ramtoken.name}/USD</h3>
					<p class="text-on-surface justify-self-end text-xl font-semibold text-nowrap">
						<AssetText
							value={calculateValue(
								network.resources.ram.price.rammarket,
								market.network.systemtoken.price
							)}
							variant="full"
						/>
					</p>
				</Card>
			{/if}
		</div>
	</div>
</section>
