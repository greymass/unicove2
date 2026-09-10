import { json, text } from '@sveltejs/kit';

import { ContractKit } from '@wharfkit/contract';
import { Name, Serializer, Transaction } from '@wharfkit/antelope';
import type { RequestEvent } from './$types';
import { stringableTypes } from '$lib/types/string';

export async function GET({ locals: { network }, params }: RequestEvent) {
	const contractKit = new ContractKit({
		client: network.client
	});
	const contract = await contractKit.load(params.contract);

	const { action } = params;
	const act = contract.action(action, params.data || {});
	// Remove authorizations
	act.authorization = [];
	// Assemble readonly transaction
	const transaction = Transaction.from({
		ref_block_num: 0,
		ref_block_prefix: 0,
		expiration: 0,
		actions: [act]
	});
	// Execute and retrieve response
	const response = await contractKit.client.v1.chain.send_read_only_transaction(transaction);
	if (response.processed.except) {
		throw new Error(JSON.stringify(response.processed.except));
	}
	// Decode and return results
	const hexData = response.processed.action_traces[0].return_value_hex_data;
	const returnType = contract.abi.action_results.find((a) => Name.from(a.name).equals(action));
	if (!returnType) {
		throw new Error(`Return type for ${name} not defined in the ABI.`);
	}

	const decoded = Serializer.decode({
		data: hexData,
		type: returnType.result_type,
		abi: contract.abi
	});

	if (stringableTypes.includes(returnType.result_type)) {
		return text(String(decoded), { status: 200 });
	} else {
		return json(decoded, { status: 200 });
	}
}
