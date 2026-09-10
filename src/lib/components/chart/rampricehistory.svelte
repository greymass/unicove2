<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import ChartContainer from './chart-container.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import type { HistoricalPrice } from '$lib/types';
	import Loading from './loading.svelte';
	import { ramtoken } from '$lib/wharf/chains';
	import { ZeroUnits } from '$lib/types/token';

	const { network, urlPath } = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	type Price = { date: string; value: number };
	type APIResponse = Price[] | { error: string };

	const fetchRamPrices = async () => {
		if (network.supports('timeseries')) {
			try {
				const response = await fetch(urlPath(`/api/metrics/marketprice/ram`));
				const parsedRamResponse: APIResponse = await response.json();

				if (Array.isArray(parsedRamResponse) && parsedRamResponse.length) {
					return parsedRamResponse.map(
						(price: Price) =>
							({
								date: new Date(price.date),
								value: Asset.from(
									price.value / 10000,
									network.chain.systemToken?.symbol || '0,UNKNOWN'
								)
							}) as HistoricalPrice
					);
				} else if ('error' in parsedRamResponse && parsedRamResponse.error) {
					throw new Error(String(parsedRamResponse.error));
				}
			} catch (e) {
				console.warn('RAM price history unavailable', e);
			}
		}
		return [];
	};

	let systemtoken = Asset.Symbol.from(network.config.systemtoken.symbol);
	let pair = $derived(`${ramtoken.name}/${systemtoken.name}`);
</script>

{#await fetchRamPrices()}
	<Loading {pair} />
{:then ramPrices}
	{#if ramPrices.length}
		{@const latest = {
			date: new Date(),
			value: market.network.ramtoken.price.units.gt(ZeroUnits)
				? market.network.ramtoken.price
				: ramPrices[0].value
		}}
		<ChartContainer {pair} data={[latest, ...ramPrices]} type="line" />
	{/if}
{/await}
