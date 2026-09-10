import type { Action, NameType, UInt32Type, UInt8Type } from '@wharfkit/antelope';
import { ABI, Blob, Name, Struct, UInt32, UInt8 } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yAAMKY29uZmlnX3JvdwADEG1heF90aXRsZV9sZW5ndGgGdWludDMyD21heF9ib2R5X2xlbmd0aAZ1aW50MzIIbWF4X3RhZ3MFdWludDgMcG9zdF9jb250ZW50AAMFdGl0bGUGc3RyaW5nBGJvZHkGc3RyaW5nBHRhZ3MGbmFtZVtdCXNldGNvbmZpZwAEB2NoYW5uZWwEbmFtZRBtYXhfdGl0bGVfbGVuZ3RoBnVpbnQzMg9tYXhfYm9keV9sZW5ndGgGdWludDMyCG1heF90YWdzBXVpbnQ4AQAAYG5NirLCCXNldGNvbmZpZwACAAAAADC3JkUDaTY0AAAKY29uZmlnX3JvdwDyVHlSlDGtA2k2NAAADHBvc3RfY29udGVudAAAAAAA'
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('config_row')
	export class config_row extends Struct {
		@Struct.field(UInt32)
		declare max_title_length: UInt32;
		@Struct.field(UInt32)
		declare max_body_length: UInt32;
		@Struct.field(UInt8)
		declare max_tags: UInt8;
	}
	@Struct.type('post_content')
	export class post_content extends Struct {
		@Struct.field('string')
		declare title: string;
		@Struct.field('string')
		declare body: string;
		@Struct.field(Name, { array: true })
		declare tags: Name[];
	}
	@Struct.type('setconfig')
	export class setconfig extends Struct {
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(UInt32)
		declare max_title_length: UInt32;
		@Struct.field(UInt32)
		declare max_body_length: UInt32;
		@Struct.field(UInt8)
		declare max_tags: UInt8;
	}
}
export const TableMap = {
	config: Types.config_row,
	postcontent: Types.post_content
};
export interface TableTypes {
	config: Types.config_row;
	postcontent: Types.post_content;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface setconfig {
		channel: NameType;
		max_title_length: UInt32Type;
		max_body_length: UInt32Type;
		max_tags: UInt8Type;
	}
}
export interface ActionNameParams {
	setconfig: ActionParams.setconfig;
}
export type ActionNames = keyof ActionNameParams;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('forum.msg')
		});
	}
	action<T extends ActionNames>(
		name: T,
		data: ActionNameParams[T],
		options?: ActionOptions
	): Action {
		return super.action(name, data, options);
	}
	table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
		return super.table(name, scope, TableMap[name]);
	}
}
