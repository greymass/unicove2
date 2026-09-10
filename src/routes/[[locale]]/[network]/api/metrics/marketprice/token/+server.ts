import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Asset } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';
import type { HistoricalPrice } from '$lib/types';
import { Chains } from '@wharfkit/common';

export const GET: RequestHandler = async ({ fetch, locals: { network } }) => {
	try {
		if (!network.config.endpoints.metrics) {
			return json([]);
		}
		let systemtoken = Asset.Symbol.from(network.config.systemtoken.symbol);
		// TODO: Remove this when metrics API supports new token
		if (network.chain.id.equals(Chains.EOS.id)) {
			systemtoken = Asset.Symbol.from('4,EOS');
		}
		const response = await fetch(
			`${network.config.endpoints.metrics}/marketprice/${systemtoken.name.toLowerCase()}usd/1h/1mo`
		);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const parsedResponse = await response.json();

		const historicalPrices = parsedResponse.sort(
			(a: HistoricalPrice, b: HistoricalPrice) =>
				new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		return json(historicalPrices, {
			headers: getCacheHeaders(3600)
		});
	} catch (error) {
		console.warn(error);
		return json([]);
	}
};
