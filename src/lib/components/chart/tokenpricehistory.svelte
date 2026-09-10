<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import ChartContainer from './chart-container.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import type { HistoricalPrice } from '$lib/types';
	import Loading from './loading.svelte';
	import { Currencies } from '$lib/types/currencies';
	import { calculateValue } from '$lib/utils';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	type Price = { date: string; value: number };
	type APIResponse = Price[] | { error: string };

	const fetchTokenPrices = async () => {
		if (context.network.supports('timeseries')) {
			try {
				const response = await context.network.fetch(
					context.urlPath(`/api/metrics/marketprice/token`)
				);
				const parsedTokenResponse: APIResponse = await response.json();

				if (Array.isArray(parsedTokenResponse) && parsedTokenResponse.length) {
					const currency = Currencies[context.settings.data.displayCurrency];
					const pair = market.market.getPair(Currencies.USD, currency);
					const converted = parsedTokenResponse.map((price: Price): HistoricalPrice => {
						let value = Asset.from(price.value / 10000, '4,USD');
						if (pair) {
							value = calculateValue(value, pair.price);
						}
						return {
							date: new Date(price.date),
							value
						};
					});
					const tokenpair = market.market.getPair(context.network.token.id, currency);
					if (tokenpair) {
						converted.unshift({
							date: new Date(),
							value: tokenpair.price
						});
					}
					return converted;
				} else if ('error' in parsedTokenResponse && parsedTokenResponse.error) {
					throw new Error(String(parsedTokenResponse.error));
				}
			} catch (e) {
				console.warn('Token price history unavailable', e);
			}
		}
		return [];
	};

	let systemtoken = Asset.Symbol.from(context.network.config.systemtoken.symbol);
	let currency = $derived(Currencies[context.settings.data.displayCurrency]);
	let pair = $derived(String(systemtoken.name) + '/' + currency.symbol.name);
</script>

{#await fetchTokenPrices()}
	<Loading {pair} />
{:then prices}
	{#if prices.length}
		<ChartContainer {pair} data={prices} type="line" />
	{/if}
{/await}
