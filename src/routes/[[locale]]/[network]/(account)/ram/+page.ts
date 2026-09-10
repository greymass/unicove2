import { Asset } from '@wharfkit/antelope';

import type { HistoricalPrice } from '$lib/types';
import type { PageLoad } from './$types';
import { localizePath } from '$lib/utils/url';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { network } = await parent();

	let historicalPrices: HistoricalPrice[] = [];

	if (network.supports('timeseries')) {
		try {
			const response: Response = await fetch(localizePath(`/api/metrics/marketprice/ram`));
			const parsedResponse: { date: string; value: number }[] | { error: string } =
				await response.json();
			if ('error' in parsedResponse && parsedResponse.error) {
				throw new Error(String(parsedResponse.error));
			} else if (Array.isArray(parsedResponse)) {
				historicalPrices = parsedResponse.map((price: { date: string; value: number }) => ({
					date: new Date(price.date),
					value: Asset.from(price.value / 10000, network.config.systemtoken.symbol || '0,UNKNOWN')
				}));
			}
		} catch (error: unknown) {
			console.error('Error fetching historical RAM prices:', error);
		}
	}

	return { historicalPrices };
};
