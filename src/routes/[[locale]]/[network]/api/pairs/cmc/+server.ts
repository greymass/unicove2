import { PUBLIC_FEATURE_CMC_APIKEY, PUBLIC_FEATURE_CMC_PAIRS } from '$env/static/public';
import { getCacheHeaders } from '$lib/utils';
import { json, type RequestEvent } from '@sveltejs/kit';

export async function GET({ fetch }: RequestEvent) {
	if (PUBLIC_FEATURE_CMC_APIKEY) {
		const response = await fetch(
			`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${PUBLIC_FEATURE_CMC_PAIRS}`,
			{
				headers: {
					'X-CMC_PRO_API_KEY': PUBLIC_FEATURE_CMC_APIKEY
				}
			}
		);
		const result = await response.json();
		return json(result, {
			headers: getCacheHeaders(3600)
		});
	}
}
