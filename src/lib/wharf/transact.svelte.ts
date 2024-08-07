import { type Checksum256, type Transaction } from '@wharfkit/antelope';
import type { TransactArgs, TransactOptions } from '@wharfkit/session';
import { addToast, updateToast } from '../state/toaster.svelte';

export enum StatusType {
	CREATED = 'CREATED',
	BROADCAST = 'BROADCAST',
	LOCALLY_APPLIED = 'LOCALLY_APPLIED',
	IN_BLOCK = 'IN_BLOCK',
	IRREVERSIBLE = 'IRREVERSIBLE',
	ERROR = 'ERROR'
}

export interface QueuedTransaction {
	status: StatusType;
	args: TransactArgs;
	options?: TransactOptions;
	response?: any;
	transaction?: Transaction;
	error?: string;
	toastId?: string;
}

export const transactions = $state<QueuedTransaction[]>([]);

export function updateStatus(id: Checksum256, status: StatusType) {
	const index = transactions.findIndex((t) => t.transaction?.id.equals(id));
	if (index >= 0) {
		const tx = transactions[index];
		tx.status = status;

		if (tx.toastId) {
			updateToast(tx.toastId, {
				title: tx.status,
				description: String(tx.transaction?.id),
				color: 'bg-green-200'
			});
		}

		if (tx.toastId && status === StatusType.IRREVERSIBLE) {
			sendSuccessToast(tx);
		}
	} else {
		console.error('Unable to find transaction in queue', String(id));
	}
}

export function queueTransaction(tx: QueuedTransaction) {
	transactions.push(tx);
}

export function sendErrorToast(tx: QueuedTransaction) {
	return addToast({
		data: {
			title: tx.status,
			description: String(tx.error),
			color: 'bg-red-200'
		},
		closeDelay: 5000
	});
}

export function sendSuccessToast(tx: QueuedTransaction) {
	return addToast({
		data: {
			title: tx.status,
			description: String(tx.transaction?.id),
			color: 'bg-green-200'
		},
		closeDelay: 5000
	});
}
