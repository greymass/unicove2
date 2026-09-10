import {
	Action,
	Asset,
	BlockTimestamp,
	Bytes,
	Checksum256,
	Int32,
	Int64,
	Name,
	PackedTransaction,
	PermissionLevel,
	Signature,
	SignedTransaction,
	Struct,
	Transaction,
	TransactionHeader,
	UInt32,
	UInt64,
	type NameType
} from '@wharfkit/antelope';
import { Types as HyperionTypes } from '@wharfkit/hyperion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectifiedActionData = Record<string, any>;

export abstract class SummaryTitles<V> {
	[key: string]: V;
}

export interface ContractSummaries {
	titles: SummaryTitles<string>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	components: Record<string, any>;
}

export interface ActionSummaryProps {
	class?: string;
	data: ObjectifiedActionData;
	authorization?: PermissionLevel[];
	perspectiveOf?: Name;
	value?: Asset;
}

@Struct.type('action_decoded')
export class ActionDecoded extends Action {
	@Struct.field('string') declare hex_data: string;
}

@Struct.type('account_ram_delta')
export class AccountRamDelta extends Struct {
	@Struct.field(Int32) declare delta: Int32;
	@Struct.field(Name) declare account: Name;
}

@Struct.type('action_trace_action')
export class ActionTraceAction extends Struct {
	@Struct.field(Name) declare account: Name;
	@Struct.field(Name) declare name: Name;
	@Struct.field(PermissionLevel, { array: true }) declare authorization: PermissionLevel[];
	@Struct.field('any', { optional: true }) declare data?: ObjectifiedActionData;
	@Struct.field('string') declare hex_data: string;
}

@Struct.type('action_trace_receipt')
export class ActionTraceReceipt extends Struct {
	@Struct.field(UInt64) declare abi_sequence: UInt64;
	@Struct.field(Checksum256) declare act_digest: Checksum256;
	@Struct.field('any', { array: true })
	declare auth_sequence: [Name, UInt32][];
	@Struct.field(UInt64) declare code_sequence: UInt64;
	@Struct.field(UInt64) declare global_sequence: UInt64;
	@Struct.field(Name) declare receiver: Name;
	@Struct.field(UInt64) declare recv_sequence: UInt64;
}

@Struct.type('action_trace')
export class ActionTrace extends Struct {
	@Struct.field(AccountRamDelta, { array: true })
	declare account_ram_deltas: AccountRamDelta[];
	@Struct.field(ActionTraceAction) declare act: ActionTraceAction;
	@Struct.field(UInt32) declare action_ordinal: UInt32;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(UInt32) declare closest_unnotified_ancestor_action_ordinal: UInt32;
	@Struct.field('bool') declare context_free: boolean;
	@Struct.field(UInt32) declare creator_action_ordinal: UInt32;
	@Struct.field(UInt32) declare elapsed: UInt32;
	@Struct.field(Checksum256) declare producer_block_id: Checksum256;
	@Struct.field(ActionTraceReceipt) declare receipt: ActionTraceReceipt;
	@Struct.field(Name) declare receiver: Name;
	@Struct.field(Checksum256) declare trx_id: Checksum256;

	get action(): Action {
		return Action.from({
			account: this.act.account,
			name: this.act.name,
			authorization: this.act.authorization,
			data: this.act.hex_data
		});
	}
}

@Struct.type('action_trace_filtered')
export class ActionTraceFiltered extends ActionTrace {
	@Struct.field(ActionTraceReceipt, { array: true }) declare receipts: ActionTraceReceipt[];

	get notifications(): Name[] {
		return this.receipts.map((receipt) => receipt.receiver);
	}
}

@Struct.type('transaction_response_info')
export class TransactionResponseInfo extends Struct {
	@Struct.field(Checksum256) declare trx_id: Checksum256;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(Name) declare producer_block_id: Name;
}

@Struct.type('transaction_response_info_receipt')
export class TransactionResponseTrxReceipt extends Struct {
	@Struct.field('string') declare status: string;
	@Struct.field(UInt32) declare cpu_usage_us: UInt32;
	@Struct.field(UInt32) declare net_usage_words: UInt32;
	@Struct.field('any', { array: true })
	declare trx: [number, PackedTransaction];
}

@Struct.type('transaction_response_transaction')
export class TransactionResponseTransaction extends TransactionHeader {
	@Struct.field(Action, { array: true }) declare context_free_actions: Action[];
	@Struct.field('bytes[]') declare context_free_data: Bytes[];
	@Struct.field(ActionDecoded, { array: true }) declare actions: ActionDecoded[];
	@Struct.field('signature[]') declare signatures: Signature[];
}

@Struct.type('transaction_response_trx')
export class TransactionResponseTrx extends Struct {
	@Struct.field(TransactionResponseTrxReceipt) declare receipt: TransactionResponseTrxReceipt;
	@Struct.field(TransactionResponseTransaction) declare trx: TransactionResponseTransaction;
}

@Struct.type('transaction_response')
export class TransactionResponse extends Struct {
	@Struct.field(Checksum256) declare id: Checksum256;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(UInt32) declare head_block_num: UInt32;
	@Struct.field(UInt32) declare last_irreversible_block: UInt32;
	@Struct.field('bool') declare irreversible: boolean;
	@Struct.field(ActionTrace, { array: true, optional: true })
	declare traces: ActionTrace[];
	@Struct.field(TransactionResponseTrx) declare trx: TransactionResponseTrx;

	// A deduplicated/filtered list of the traces
	get filtered(): ActionTraceFiltered[] {
		const traces: ActionTraceFiltered[] = this.traces
			.filter((trace) => trace.act.account.equals(trace.receipt.receiver))
			.map((trace) => {
				return ActionTraceFiltered.from({
					...trace,
					receipts: []
				});
			});
		return traces;
	}

	// A deduplicated list of actions in this transaction
	get actions(): Action[] {
		return this.filtered.map((trace) => trace.action);
	}

	// The unique contracts used in this transaction
	get contracts(): Name[] {
		return [...new Set(this.actions.map((action) => String(action.account)))].map((contract) =>
			Name.from(contract)
		);
	}

	// A wharfkit/antelope Transaction object from this response
	get transaction(): Transaction {
		return Transaction.from({
			...this.trx.trx,
			actions: this.trx.trx.actions.map((action) =>
				Action.from({
					...action,
					data: action.hex_data
				})
			)
		});
	}

	// A wharfkit/antelope SignedTransaction object from this response
	get signedTransaction(): SignedTransaction {
		return SignedTransaction.from({
			...this.trx.trx,
			actions: this.trx.trx.actions.map((action) =>
				Action.from({
					...action,
					data: action.hex_data
				})
			)
		});
	}
}

@Struct.type('activity_response_action')
export class ActivityResponseAction extends Struct {
	@Struct.field(UInt64, { optional: true }) declare global_action_seq?: UInt64;
	@Struct.field(UInt64, { optional: true }) declare account_action_seq?: UInt64;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(ActionTrace) declare action_trace: ActionTrace;

	static fromHyperion(account: NameType, action: HyperionTypes.v2.Action): ActivityResponseAction {
		let accountReceipt = action.receipts.find((receipt) => receipt.receiver.equals(account));
		if (!accountReceipt) {
			accountReceipt = action.receipts[0];
		}
		const receipt = ActionTraceReceipt.from({
			abi_sequence: 0,
			act_digest: Checksum256.hash(action.global_sequence.byteArray),
			auth_sequence: accountReceipt.auth_sequence.map((auth) => [
				String(auth.account),
				String(auth.sequence)
			]),
			code_sequence: 0,
			global_sequence: accountReceipt.global_sequence,
			receiver: accountReceipt.receiver,
			recv_sequence: accountReceipt.recv_sequence
		});
		const act = ActionTraceAction.from({
			account: action.act.account,
			name: action.act.name,
			authorization: action.act.authorization,
			data: action.act.data,
			hex_data: ''
		});
		const trace = ActionTrace.from({
			account_ram_deltas: [],
			act,
			action_ordinal: action.action_ordinal,
			block_num: action.block_num,
			block_time: action.timestamp,
			closest_unnotified_ancestor_action_ordinal: 0,
			context_free: false,
			creator_action_ordinal: 0,
			elapsed: 0,
			producer_block_id: action.block_id,
			receipt,
			receiver: accountReceipt.receiver,
			trx_id: action.trx_id
		});
		return ActivityResponseAction.from({
			global_action_seq: action.global_sequence,
			account_action_seq: action.global_sequence,
			block_num: action.block_num,
			block_time: action.timestamp,
			action_trace: trace
		});
	}

	get action(): Action {
		return Action.from({
			account: this.action_trace.act.account,
			name: this.action_trace.act.name,
			authorization: this.action_trace.act.authorization,
			data: this.action_trace.act.hex_data
		});
	}

	get trace(): ActionTraceFiltered {
		let receipts: ActionTraceReceipt[] = [this.action_trace.receipt];
		if ((this.action_trace as ActionTraceFiltered).receipts) {
			receipts = (this.action_trace as ActionTraceFiltered).receipts;
		}
		return ActionTraceFiltered.from({
			...this.action_trace,
			receipts
		});
	}
}

@Struct.type('activity_response')
export class ActivityResponse extends Struct {
	@Struct.field(ActivityResponseAction, { array: true }) declare actions: ActivityResponseAction[];
	@Struct.field(Int64) declare first: Int64;
	@Struct.field(Int64) declare last: Int64;
	@Struct.field(UInt32) declare head_block_num: UInt32;

	static fromHyperion(
		account: NameType,
		response: HyperionTypes.v2.GetActionsResponse
	): ActivityResponse {
		return ActivityResponse.from({
			actions: response.actions.map((action) =>
				ActivityResponseAction.fromHyperion(account, action)
			),
			first: response.actions[0].global_sequence,
			last: response.actions[response.actions.length - 1].global_sequence,
			head_block_num: response.actions[0].block_num
		});
	}
}
