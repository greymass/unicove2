import type { Action, NameType, UInt64Type } from '@wharfkit/antelope';
import { ABI, Blob, Name, Struct, UInt64 } from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yABULY2hhbm5lbF9yb3cABAJpZARuYW1lBW93bmVyBG5hbWUGZm9ybWF0BG5hbWUFaG9va3MGbmFtZVtdBmNyZWF0ZQACBW93bmVyBG5hbWUHY2hhbm5lbARuYW1lA2RlbAADBnNlbmRlcgRuYW1lB2NoYW5uZWwEbmFtZQNzZXEGdWludDY0CGRlbGluYm94AAEHYWNjb3VudARuYW1lB2Rlc3Ryb3kAAgVvd25lcgRuYW1lB2NoYW5uZWwEbmFtZQJkbQADBnNlbmRlcgRuYW1lCXJlY2lwaWVudARuYW1lB2NvbnRlbnQGc3RyaW5nBGVkaXQABAZzZW5kZXIEbmFtZQdjaGFubmVsBG5hbWUDc2VxBnVpbnQ2NAdjb250ZW50BnN0cmluZxRnZXRfY2hhbm5lbF9yZXNwb25zZQAEAmlkBG5hbWUFb3duZXIEbmFtZQZmb3JtYXQEbmFtZQVob29rcwZuYW1lW10SZ2V0X2luYm94X3Jlc3BvbnNlAAMHYWNjb3VudARuYW1lBmZvcm1hdARuYW1lBWhvb2tzBm5hbWVbXQpnZXRjaGFubmVsAAEHY2hhbm5lbARuYW1lCGdldGluYm94AAEHYWNjb3VudARuYW1lCWluYm94X3JvdwADB2FjY291bnQEbmFtZQZmb3JtYXQEbmFtZQVob29rcwZuYW1lW10FcmVhY3QABAZzZW5kZXIEbmFtZQdjaGFubmVsBG5hbWUDc2VxBnVpbnQ2NAdjb250ZW50BnN0cmluZwVyZXBseQAEBnNlbmRlcgRuYW1lB2NoYW5uZWwEbmFtZQNzZXEGdWludDY0B2NvbnRlbnQGc3RyaW5nBHNlbmQAAwZzZW5kZXIEbmFtZQdjaGFubmVsBG5hbWUHY29udGVudAZzdHJpbmcLc2V0ZG1mb3JtYXQAAgdhY2NvdW50BG5hbWUGZm9ybWF0BG5hbWUKc2V0ZG1ob29rcwACB2FjY291bnQEbmFtZQVob29rcwZuYW1lW10Jc2V0Zm9ybWF0AAMFb3duZXIEbmFtZQdjaGFubmVsBG5hbWUGZm9ybWF0BG5hbWUIc2V0aG9va3MAAwVvd25lcgRuYW1lB2NoYW5uZWwEbmFtZQVob29rcwZuYW1lW10Ic2V0b3duZXIAAwVvd25lcgRuYW1lB2NoYW5uZWwEbmFtZQhuZXdvd25lcgRuYW1lB3VucmVhY3QABAZzZW5kZXIEbmFtZQdjaGFubmVsBG5hbWUDc2VxBnVpbnQ2NAdjb250ZW50BnN0cmluZxEAAAAAqGzURQZjcmVhdGUAAAAAAAAAokoDZGVsAAAAAJ2e6aJKCGRlbGluYm94AAAAAMDTm7FKB2Rlc3Ryb3kAAAAAAAAAgEwCZG0AAAAAAACQXVIEZWRpdAAAQFRzmoayYgpnZXRjaGFubmVsAAAAAJ2e6bJiCGdldGluYm94AAAAAACAjIy6BXJlYWN0AAAAAAAAH6u6BXJlcGx5AAAAAAAAkKbCBHNlbmQAALKRly6ZssILc2V0ZG1mb3JtYXQAAACGlDaZssIKc2V0ZG1ob29rcwAAAMhGXrqywglzZXRmb3JtYXQAAAAAGFLassIIc2V0aG9va3MAAAAAV01Os8IIc2V0b3duZXIAAAAAICOj7tQHdW5yZWFjdAACAAAAOKo5TUMDaTY0AAALY2hhbm5lbF9yb3cAAAAAq07PdANpNjQAAAlpbmJveF9yb3cAAAAAAgBAVHOahrJiFGdldF9jaGFubmVsX3Jlc3BvbnNlAAAAnZ7psmISZ2V0X2luYm94X3Jlc3BvbnNl'
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('channel_row')
	export class channel_row extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare format: Name;
		@Struct.field(Name, { array: true })
		declare hooks: Name[];
	}
	@Struct.type('create')
	export class create extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare channel: Name;
	}
	@Struct.type('del')
	export class del extends Struct {
		@Struct.field(Name)
		declare sender: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(UInt64)
		declare seq: UInt64;
	}
	@Struct.type('delinbox')
	export class delinbox extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('destroy')
	export class destroy extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare channel: Name;
	}
	@Struct.type('dm')
	export class dm extends Struct {
		@Struct.field(Name)
		declare sender: Name;
		@Struct.field(Name)
		declare recipient: Name;
		@Struct.field('string')
		declare content: string;
	}
	@Struct.type('edit')
	export class edit extends Struct {
		@Struct.field(Name)
		declare sender: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(UInt64)
		declare seq: UInt64;
		@Struct.field('string')
		declare content: string;
	}
	@Struct.type('get_channel_response')
	export class get_channel_response extends Struct {
		@Struct.field(Name)
		declare id: Name;
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare format: Name;
		@Struct.field(Name, { array: true })
		declare hooks: Name[];
	}
	@Struct.type('get_inbox_response')
	export class get_inbox_response extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare format: Name;
		@Struct.field(Name, { array: true })
		declare hooks: Name[];
	}
	@Struct.type('getchannel')
	export class getchannel extends Struct {
		@Struct.field(Name)
		declare channel: Name;
	}
	@Struct.type('getinbox')
	export class getinbox extends Struct {
		@Struct.field(Name)
		declare account: Name;
	}
	@Struct.type('inbox_row')
	export class inbox_row extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare format: Name;
		@Struct.field(Name, { array: true })
		declare hooks: Name[];
	}
	@Struct.type('react')
	export class react extends Struct {
		@Struct.field(Name)
		declare sender: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(UInt64)
		declare seq: UInt64;
		@Struct.field('string')
		declare content: string;
	}
	@Struct.type('reply')
	export class reply extends Struct {
		@Struct.field(Name)
		declare sender: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(UInt64)
		declare seq: UInt64;
		@Struct.field('string')
		declare content: string;
	}
	@Struct.type('send')
	export class send extends Struct {
		@Struct.field(Name)
		declare sender: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field('string')
		declare content: string;
	}
	@Struct.type('setdmformat')
	export class setdmformat extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare format: Name;
	}
	@Struct.type('setdmhooks')
	export class setdmhooks extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name, { array: true })
		declare hooks: Name[];
	}
	@Struct.type('setformat')
	export class setformat extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(Name)
		declare format: Name;
	}
	@Struct.type('sethooks')
	export class sethooks extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(Name, { array: true })
		declare hooks: Name[];
	}
	@Struct.type('setowner')
	export class setowner extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(Name)
		declare newowner: Name;
	}
	@Struct.type('unreact')
	export class unreact extends Struct {
		@Struct.field(Name)
		declare sender: Name;
		@Struct.field(Name)
		declare channel: Name;
		@Struct.field(UInt64)
		declare seq: UInt64;
		@Struct.field('string')
		declare content: string;
	}
}
export const TableMap = {
	channels: Types.channel_row,
	inboxes: Types.inbox_row
};
export interface TableTypes {
	channels: Types.channel_row;
	inboxes: Types.inbox_row;
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface create {
		owner: NameType;
		channel: NameType;
	}
	export interface del {
		sender: NameType;
		channel: NameType;
		seq: UInt64Type;
	}
	export interface delinbox {
		account: NameType;
	}
	export interface destroy {
		owner: NameType;
		channel: NameType;
	}
	export interface dm {
		sender: NameType;
		recipient: NameType;
		content: string;
	}
	export interface edit {
		sender: NameType;
		channel: NameType;
		seq: UInt64Type;
		content: string;
	}
	export interface getchannel {
		channel: NameType;
	}
	export interface getinbox {
		account: NameType;
	}
	export interface react {
		sender: NameType;
		channel: NameType;
		seq: UInt64Type;
		content: string;
	}
	export interface reply {
		sender: NameType;
		channel: NameType;
		seq: UInt64Type;
		content: string;
	}
	export interface send {
		sender: NameType;
		channel: NameType;
		content: string;
	}
	export interface setdmformat {
		account: NameType;
		format: NameType;
	}
	export interface setdmhooks {
		account: NameType;
		hooks: NameType[];
	}
	export interface setformat {
		owner: NameType;
		channel: NameType;
		format: NameType;
	}
	export interface sethooks {
		owner: NameType;
		channel: NameType;
		hooks: NameType[];
	}
	export interface setowner {
		owner: NameType;
		channel: NameType;
		newowner: NameType;
	}
	export interface unreact {
		sender: NameType;
		channel: NameType;
		seq: UInt64Type;
		content: string;
	}
}
export interface ActionNameParams {
	create: ActionParams.create;
	del: ActionParams.del;
	delinbox: ActionParams.delinbox;
	destroy: ActionParams.destroy;
	dm: ActionParams.dm;
	edit: ActionParams.edit;
	getchannel: ActionParams.getchannel;
	getinbox: ActionParams.getinbox;
	react: ActionParams.react;
	reply: ActionParams.reply;
	send: ActionParams.send;
	setdmformat: ActionParams.setdmformat;
	setdmhooks: ActionParams.setdmhooks;
	setformat: ActionParams.setformat;
	sethooks: ActionParams.sethooks;
	setowner: ActionParams.setowner;
	unreact: ActionParams.unreact;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	getchannel: Types.get_channel_response;
	getinbox: Types.get_inbox_response;
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('msg')
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
	table<T extends TableNames>(name: T, scope?: NameType): Table<RowType<T>> {
		return super.table(name, scope, TableMap[name]);
	}
}
