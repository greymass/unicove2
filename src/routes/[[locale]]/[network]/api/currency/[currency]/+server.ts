import { json } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import { TokenDataSources, TokenPair } from '$lib/types/token';
import { Asset, TimePointSec } from '@wharfkit/session';
import { Currencies, SupportedCurrencies } from '$lib/types/currencies';
import type { RequestEvent } from './$types';

export async function GET({ fetch, params }: RequestEvent) {
	const currency = params.currency.toUpperCase() as SupportedCurrencies;
	if (!params.currency || Currencies[currency] === undefined) {
		return json({
			code: 404,
			message: 'Currency not found'
		});
	}
	const fiat = await fetch(`https://api.frankfurter.dev/v1/latest?base=${params.currency}`);
	const data = await fiat.json();
	const pairs = Object.keys(data.rates).map((rate) => {
		return TokenPair.from({
			base: {
				id: {
					symbol: '4,USD'
				}
			},
			quote: {
				id: {
					symbol: `4,${rate}`
				}
			},
			price: Asset.fromFloat(data.rates[rate], `4,${rate}`),
			updated: TimePointSec.from(new Date(data.date))
		});
	});
	return json(
		TokenDataSources.from({
			ts: new Date(),
			pairs
		}),
		{
			headers: getCacheHeaders(300)
		}
	);
}
