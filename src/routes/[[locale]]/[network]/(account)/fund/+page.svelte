<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import binanceLogo from '$lib/assets/exchanges/binance.webp?enhanced';
	import krakenLogo from '$lib/assets/exchanges/kraken.webp?enhanced';
	import okxLogo from '$lib/assets/exchanges/okx.webp?enhanced';
	import huobiLogo from '$lib/assets/exchanges/huobi.webp?enhanced';
	import gateioLogo from '$lib/assets/exchanges/gate-io.webp?enhanced';
	import upbitLogo from '$lib/assets/exchanges/upbit.webp?enhanced';
	import kucoinLogo from '$lib/assets/exchanges/kucoin.webp?enhanced';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { DL, DLRow, DD } from '@wharfkit/svelte-components';
	import coinbaseLogo from '$lib/assets/exchanges/coinbase.svg';
	import { Stack } from '@wharfkit/svelte-components';
	import { Cluster } from '@wharfkit/svelte-components';
	import { CoinbaseOnRamp } from './onramps/coinbase.svelte';

	const context = getContext<UnicoveContext>('state');

	const coinbaseOnRamp = new CoinbaseOnRamp(context);

	const ON_RAMP_PROVIDERS = $derived(
		context.network.config.coinbase
			? [
					{
						id: 'coinbase',
						logo: coinbaseLogo,
						isLoading: coinbaseOnRamp.isLoading,
						action: {
							text: `Buy ${context.network.token.symbol.name} with Coinbase`,
							handler: () => coinbaseOnRamp.open()
						}
					}
				]
			: []
	);

	const EXCHANGES = [
		{
			name: 'Binance',
			logo: binanceLogo,
			url: 'https://www.binance.com'
		},
		{
			name: 'Kraken',
			logo: krakenLogo,
			url: 'https://www.kraken.com'
		},
		{
			name: 'OKX',
			logo: okxLogo,
			url: 'https://www.okx.com'
		},
		{
			name: 'Huobi Global',
			logo: huobiLogo,
			url: 'https://global-aws.huobi.com'
		},
		{
			name: 'Gate.io',
			logo: gateioLogo,
			url: 'https://www.gate.io'
		},
		{
			name: 'Upbit',
			logo: upbitLogo,
			url: 'https://upbit.com'
		},
		{
			name: 'Kucoin',
			logo: kucoinLogo,
			url: 'https://kucoin.com'
		}
	] as const;
</script>

<Stack class="mt-6 gap-12">
	{#if ON_RAMP_PROVIDERS.length > 0}
		<Stack class="gap-4">
			<h2 class="text-headline leading-4">Purchase Directly</h2>
			<p>
				Purchase {context.network.token.symbol.name} and have it directly send to your account using
				one of the platforms below.
			</p>
			<Cluster tag="ul">
				{#each ON_RAMP_PROVIDERS as provider}
					<Card tag="li" class="max-w-sm p-6">
						<div>
							<div class="mb-4 flex items-center justify-center">
								<img src={provider.logo} alt={provider.id} class="h-24 w-3/5 object-contain" />
							</div>
							<DL>
								{#if context.network.config.coinbase}
									<DLRow title="Token to Purchase">
										<DD>{context.network.config.coinbase.assets.join(', ')}</DD>
									</DLRow>
								{/if}
								<DLRow title="Receiving Account">
									<DD>
										{#if context.account}
											{context.account?.name}
										{:else}
											Not logged in
										{/if}
									</DD>
								</DLRow>
							</DL>
						</div>

						<div class="mt-6">
							{#if !context.account}
								<p class="text-sm">You must be logged in with an account to use this feature.</p>
							{:else}
								<Button
									class="w-full"
									disabled={provider.isLoading}
									onclick={provider.action.handler}
								>
									{#if provider.isLoading}
										Loading
									{:else}
										{provider.action.text}
									{/if}</Button
								>
							{/if}
						</div>
					</Card>
				{/each}
			</Cluster>
		</Stack>
	{/if}

	<Stack class="gap-4">
		<h2 class="text-headline leading-4">Exchanges</h2>

		<p>
			{context.network.token.symbol.name} can be purchased through a number of platforms, depending on
			the users needs and location. Below are some of the most popular options available.
		</p>

		<ul class="layout-grid" style="--grid-itemWidth:10rem;">
			{#each EXCHANGES as exchange}
				<Card tag="li" class="">
					<a
						href={exchange.url}
						target="_blank"
						rel="noopener noreferrer"
						class="block h-full transition-all hover:scale-105"
					>
						<div class="bg-surface-container-high mb-4 grid aspect-square rounded-lg p-4">
							<enhanced:img
								src={exchange.logo}
								alt="{exchange.name} logo"
								class="h-full object-cover"
							/>
						</div>
						<h3 class="text-center text-lg font-medium">{exchange.name}</h3>
					</a>
				</Card>
			{/each}
		</ul>
	</Stack>
</Stack>
