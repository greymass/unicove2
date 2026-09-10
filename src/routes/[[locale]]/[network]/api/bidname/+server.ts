import { json } from '@sveltejs/kit';
import { PUBLIC_BIDNAME_MAX_TRACKED } from '$env/static/public';

import type { BidnameApiResponse } from '$lib/state/bidname.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network }, url }: RequestEvent) {
	const top = parseInt(url.searchParams.get('top') || '0', 10);
	const namesParam = url.searchParams.get('names');
	const account = url.searchParams.get('account');
	const search = url.searchParams.get('search');

	const maxNames = parseInt(PUBLIC_BIDNAME_MAX_TRACKED, 10) || 20;
	const names = namesParam ? namesParam.split(',').filter(Boolean).slice(0, maxNames) : [];

	try {
		const eosio = network.contracts.eosio;
		const promises: Record<string, Promise<unknown>> = {};

		if (top > 0) {
			promises.topBids = eosio
				.table('namebids')
				.query({
					index_position: 'secondary',
					key_type: 'i64',
					from: '9223372036854775808',
					maxRows: top
				})
				.all();
			promises.globalState = eosio.table('global').get();
		}

		for (const name of names) {
			promises[`bid:${name}`] = eosio
				.table('namebids')
				.get(name)
				.catch(() => null);
			promises[`account:${name}`] = network.client.v1.chain
				.get_account(name)
				.then(() => true)
				.catch(() => false);
			if (account) {
				promises[`refund:${name}`] = eosio
					.table('bidrefunds', name)
					.get(account)
					.catch(() => null);
			}
		}

		if (search) {
			promises.searchBid = eosio
				.table('namebids')
				.get(search)
				.catch(() => null);
			promises.searchAccount = network.client.v1.chain
				.get_account(search)
				.then(() => true)
				.catch(() => false);
		}

		const keys = Object.keys(promises);
		const values = await Promise.all(Object.values(promises));
		const results: Record<string, unknown> = Object.fromEntries(keys.map((k, i) => [k, values[i]]));

		const response: BidnameApiResponse = { ts: new Date().toISOString() };

		if (top > 0) {
			const rawBids = results.topBids as { high_bid: { toNumber(): number } }[] | undefined;
			response.topBids = (rawBids ?? []).filter((bid) => bid.high_bid.toNumber() > 0);
			const globalState = results.globalState as { last_name_close?: unknown } | undefined;
			response.lastNameClose = globalState?.last_name_close ?? null;
		}

		if (names.length > 0) {
			response.trackedBids = names.map((name) => ({
				name,
				bid: results[`bid:${name}`] ?? null,
				refund: account ? (results[`refund:${name}`] ?? null) : null,
				accountExists: Boolean(results[`account:${name}`])
			}));
		}

		if (search) {
			response.searchResult = {
				name: search,
				bid: results.searchBid ?? null,
				accountExists: Boolean(results.searchAccount)
			};
		}

		const hasUserParams = !!(account || search);
		const cacheTtl = hasUserParams ? 2 : 5;

		return json(response, {
			headers: getCacheHeaders(cacheTtl)
		});
	} catch (e) {
		console.error('GET bidname error', e);
		return json({ ts: new Date().toISOString(), error: String(e) }, { status: 500 });
	}
}
