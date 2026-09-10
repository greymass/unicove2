import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';
import { getAPR } from '$lib/utils/staking';

export const GET: RequestHandler = async ({ locals: { network } }) => {
	try {
		const distribution = await network.contracts.unicove.readonly('distribution', {
			def: {
				contract: network.contracts.system.account,
				symbol: network.token.symbol
			}
		});

		return json(
			{
				staked: distribution.distribution?.staked,
				apr: getAPR(distribution.distribution?.staked)
			},
			{
				headers: getCacheHeaders(300)
			}
		);
	} catch (error) {
		console.warn(error);
		return json([]);
	}
};
