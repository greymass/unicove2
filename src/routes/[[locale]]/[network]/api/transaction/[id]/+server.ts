import { json } from '@sveltejs/kit';
import { Checksum256 } from '@wharfkit/antelope';

import type { RequestEvent } from './$types';
import { getCacheHeaders } from '$lib/utils';
import { chainErrorStatus } from '$lib/utils/chainerror';
import { getBackendClient, getRobo2Client } from '$lib/wharf/client/ssr';
import { TransactionResponse } from '$lib/types/transaction';

async function getTransactionFromRobo2(
	network: string,
	fetch: typeof globalThis.fetch,
	id: string
): Promise<TransactionResponse | undefined> {
	const robo = getRobo2Client(network, fetch);
	if (!robo) return undefined;
	try {
		const response = await robo.transaction(Checksum256.from(id));
		return TransactionResponse.from(response);
	} catch {
		return undefined;
	}
}

async function getTransactionFromHistory(
	network: string,
	fetch: typeof globalThis.fetch,
	id: string
): Promise<TransactionResponse> {
	const client = getBackendClient(network, fetch, { history: true });
	return client.call({
		path: '/v1/history/get_transaction',
		params: { id: Checksum256.from(id) },
		responseType: TransactionResponse
	});
}

export async function GET({ fetch, locals, params }: RequestEvent) {
	const network = String(locals.network);
	let transaction: TransactionResponse | undefined;

	try {
		Checksum256.from(params.id);
	} catch {
		return json({ error: 'Transaction not found.' }, { status: 404, headers: getCacheHeaders(60) });
	}

	if (locals.network.supports('robo2')) {
		transaction = await getTransactionFromRobo2(network, fetch, params.id);
	}

	if (!transaction) {
		try {
			transaction = await getTransactionFromHistory(network, fetch, params.id);
		} catch (e) {
			const status = chainErrorStatus(e);
			return json(
				{ error: status === 404 ? 'Transaction not found.' : 'Unable to load transaction.' },
				{ status, headers: status === 404 ? getCacheHeaders(60) : {} }
			);
		}
	}

	const irreversible = transaction.last_irreversible_block.gte(transaction.block_num);
	const headers = getCacheHeaders(5, irreversible);
	return json(transaction, { headers });
}
