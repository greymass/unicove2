import { error } from '@sveltejs/kit';

import { truncateCenter } from '$lib/utils';
import { TransactionResponse } from '$lib/types/transaction';
import type { LayoutLoad } from './$types';
import { formatDateTime, useLocale } from '$lib/utils/intl';
import { localizePath } from '$lib/utils/url';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	const response = await fetch(localizePath(`/api/transaction/${params.id}`));
	const json: TransactionResponse = await response.json();
	if (!json.id) {
		error(404, {
			message: `Transaction not found: ${params.id}`,
			code: 'NOT_FOUND',
			title: truncateCenter(params.id || '', 14),
			subtitle: 'Transaction'
		});
	}
	const transaction = TransactionResponse.from(json);
	const lang = 'en';
	return {
		transaction,
		title: `${truncateCenter(String(json.id), 14)}`,
		subtitle: `Transaction on ${formatDateTime(transaction.block_time.toDate(), lang, {
			dateStyle: 'long',
			timeZone: 'UTC'
		})}`,
		header: {
			copyData: params.id
		},
		id: params.id,
		seq: params.seq,
		pageMetaTags: {
			title: `${String(transaction.id)} | ${network.chain.name} Network`,
			description: `A transaction performed at ${formatDateTime(
				transaction.block_time.toDate(),
				lang,
				{
					dateStyle: 'long',
					timeZone: 'UTC'
				}
			)} on the ${network.chain.name} Network.`
		}
	};
};
