import type { Action } from '@wharfkit/antelope';
import { ABI, Asset, Blob, Name, Struct, TimePoint } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yAAQIZ2V0cGFpcnMAABB0b2tlbl9kZWZpbml0aW9uAAIGc3ltYm9sBnN5bWJvbAhjb250cmFjdARuYW1lCnRva2VuX3BhaXIABARiYXNlEHRva2VuX2RlZmluaXRpb24FcXVvdGUQdG9rZW5fZGVmaW5pdGlvbgVwcmljZQVhc3NldAd1cGRhdGVkCnRpbWVfcG9pbnQJdG9rZW5wYWlyAAACAAAA+DpTs2IIZ2V0cGFpcnPXAS0tLQoKc3BlY192ZXJzaW9uOiAiMC4yLjAiCnRpdGxlOiBnZXRwYWlycwpzdW1tYXJ5OiAnUmVhZC1vbmx5IEFQSSB0byByZXR1cm4gYWxsIGRlbHBob3JhY2xlIHRva2VuIHBhaXJzJwppY29uOiBodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTQ3MjkyODYxP3M9NDAwJnU9M2IxYWY2NmU5MGRkODUxZjRkN2MwOTZlZDZhMmZiYjRiOWUxOTBkYQoKLS0tAAC4ztSpIM0JdG9rZW5wYWlyywEtLS0KCnNwZWNfdmVyc2lvbjogIjAuMi4wIgp0aXRsZTogdG9rZW5wYWlyCnN1bW1hcnk6ICdOT09QOiB1c2VkIHRvIGV4cG9ydCB0b2tlbl9wYWlyIHN0cnVjdCcKaWNvbjogaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE0NzI5Mjg2MT9zPTQwMCZ1PTNiMWFmNjZlOTBkZDg1MWY0ZDdjMDk2ZWQ2YTJmYmI0YjllMTkwZGEKCi0tLQABDGRlbHBoaWhlbHBlcgxkZWxwaGloZWxwZXIAAAACAAAA+DpTs2IMdG9rZW5fcGFpcltdAAC4ztSpIM0KdG9rZW5fcGFpcg=='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('getpairs')
	export class getpairs extends Struct {}
	@Struct.type('token_definition')
	export class token_definition extends Struct {
		@Struct.field(Asset.Symbol)
		declare symbol: Asset.Symbol;
		@Struct.field(Name)
		declare contract: Name;
	}
	@Struct.type('token_pair')
	export class token_pair extends Struct {
		@Struct.field(token_definition)
		declare base: token_definition;
		@Struct.field(token_definition)
		declare quote: token_definition;
		@Struct.field(Asset)
		declare price: Asset;
		@Struct.field(TimePoint)
		declare updated: TimePoint;
	}
	@Struct.type('tokenpair')
	export class tokenpair extends Struct {}
}
export const TableMap = {};
export interface TableTypes {}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface getpairs {}
	export interface tokenpair {}
}
export interface ActionNameParams {
	getpairs: ActionParams.getpairs;
	tokenpair: ActionParams.tokenpair;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	getpairs: Types.token_pair[];
	tokenpair: Types.token_pair;
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('delphihelper')
		});
	}
	action<T extends ActionNames>(
		name: T,
		data: ActionNameParams[T],
		options?: ActionOptions
	): Action {
		return super.action(name, data, options);
	}
	readonly<T extends ActionReturnNames>(
		name: T,
		data?: ActionNameParams[T]
	): ActionReturnValues[T] {
		return super.readonly(name, data) as unknown as ActionReturnValues[T];
	}
}
