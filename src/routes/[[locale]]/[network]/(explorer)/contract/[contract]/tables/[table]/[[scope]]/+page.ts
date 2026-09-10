import { localizePath } from '$lib/utils/url';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
	const { contract, network } = await parent();

	const from = url.searchParams.get('from') || url.searchParams.get('lower') || '';
	const to = url.searchParams.get('to') || url.searchParams.get('upper') || '';
	const orderParam = url.searchParams.get('order');
	const reverseParam = url.searchParams.get('reverse');
	const order: 'asc' | 'desc' = orderParam
		? (orderParam as 'asc' | 'desc')
		: reverseParam === 'true'
			? 'desc'
			: 'asc';
	const index = url.searchParams.get('index') || 'primary';
	const keyType = url.searchParams.get('key_type') || 'i64';
	const limit = Number(url.searchParams.get('limit') || 10);

	const apiParams = new URLSearchParams();
	if (from) apiParams.set('from', from);
	if (to) apiParams.set('to', to);
	if (order === 'desc') apiParams.set('order', 'desc');
	if (index !== 'primary') apiParams.set('index', index);
	if (keyType !== 'i64') apiParams.set('key_type', keyType);
	if (limit !== 10) apiParams.set('limit', String(limit));

	const response = await fetch(
		localizePath(
			`/api/contract/${params.contract}/table/${params.table}/${params.scope || params.contract}?${apiParams}`
		)
	);
	const json = await response.json();
	return {
		pageMetaTags: {
			title: `Table: ${params.table}`,
			description: `The ${params.table} data table in the ${contract} smart contract on the ${network.chain.name} network.`
		},
		rows: json.rows || [],
		next: json.next,
		error: json.error || null,
		table: params.table,
		scope: params.scope,
		from,
		to,
		order,
		index,
		keyType,
		limit,
		lower: url.searchParams.get('lower') || from,
		upper: url.searchParams.get('upper') || to,
		reverse: order === 'desc'
	};
};
