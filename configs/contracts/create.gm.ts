import type { Action, AssetType, NameType, UInt64Type } from '@wharfkit/antelope';
import {
	ABI,
	Asset,
	Blob,
	Name,
	PublicKey,
	Struct,
	UInt16,
	UInt32,
	UInt64
} from '@wharfkit/antelope';
import type { ActionOptions, ContractArgs, PartialBy, Table } from '@wharfkit/contract';
import { Contract as BaseContract } from '@wharfkit/contract';
export const abiBlob = Blob.from(
	'DmVvc2lvOjphYmkvMS4yAAkJYXV0aG9yaXR5AAQJdGhyZXNob2xkBnVpbnQzMgRrZXlzDGtleV93ZWlnaHRbXQhhY2NvdW50cxlwZXJtaXNzaW9uX2xldmVsX3dlaWdodFtdBXdhaXRzDXdhaXRfd2VpZ2h0W10MZXN0aW1hdGVjb3N0AAAKa2V5X3dlaWdodAACA2tleQpwdWJsaWNfa2V5BndlaWdodAZ1aW50MTYLbG9nY3JlYXRpb24ABQdhY2NvdW50BG5hbWUEZnJvbQRuYW1lBmV4Y2VzcwVhc3NldANyYW0FYXNzZXQJdGltZXN0YW1wBnVpbnQ2NBNwYWlyX25hbWVfYXV0aG9yaXR5AAIFZmlyc3QEbmFtZQZzZWNvbmQJYXV0aG9yaXR5CXBhcnNlbWVtbwABBG1lbW8Gc3RyaW5nEHBlcm1pc3Npb25fbGV2ZWwAAgVhY3RvcgRuYW1lCnBlcm1pc3Npb24EbmFtZRdwZXJtaXNzaW9uX2xldmVsX3dlaWdodAACCnBlcm1pc3Npb24QcGVybWlzc2lvbl9sZXZlbAZ3ZWlnaHQGdWludDE2C3dhaXRfd2VpZ2h0AAIId2FpdF9zZWMGdWludDMyBndlaWdodAZ1aW50MTYDkDFFKhvpMlYMZXN0aW1hdGVjb3N0AAAmddmoixiNC2xvZ2NyZWF0aW9uAAAAoFJJha+pCXBhcnNlbWVtbwAAAQZjcmVhdGUGY3JlYXRlAAAAApAxRSob6TJWBWFzc2V0AACgUkmFr6kTcGFpcl9uYW1lX2F1dGhvcml0eQ=='
);
export const abi = ABI.from(abiBlob);
export namespace Types {
	@Struct.type('key_weight')
	export class key_weight extends Struct {
		@Struct.field(PublicKey)
		declare key: PublicKey;
		@Struct.field(UInt16)
		declare weight: UInt16;
	}
	@Struct.type('permission_level')
	export class permission_level extends Struct {
		@Struct.field(Name)
		declare actor: Name;
		@Struct.field(Name)
		declare permission: Name;
	}
	@Struct.type('permission_level_weight')
	export class permission_level_weight extends Struct {
		@Struct.field(permission_level)
		declare permission: permission_level;
		@Struct.field(UInt16)
		declare weight: UInt16;
	}
	@Struct.type('wait_weight')
	export class wait_weight extends Struct {
		@Struct.field(UInt32)
		declare wait_sec: UInt32;
		@Struct.field(UInt16)
		declare weight: UInt16;
	}
	@Struct.type('authority')
	export class authority extends Struct {
		@Struct.field(UInt32)
		declare threshold: UInt32;
		@Struct.field(key_weight, { array: true })
		declare keys: key_weight[];
		@Struct.field(permission_level_weight, { array: true })
		declare accounts: permission_level_weight[];
		@Struct.field(wait_weight, { array: true })
		declare waits: wait_weight[];
	}
	@Struct.type('estimatecost')
	export class estimatecost extends Struct {}
	@Struct.type('logcreation')
	export class logcreation extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Asset)
		declare excess: Asset;
		@Struct.field(Asset)
		declare ram: Asset;
		@Struct.field(UInt64)
		declare timestamp: UInt64;
	}
	@Struct.type('pair_name_authority')
	export class pair_name_authority extends Struct {
		@Struct.field(Name)
		declare first: Name;
		@Struct.field(authority)
		declare second: authority;
	}
	@Struct.type('parsememo')
	export class parsememo extends Struct {
		@Struct.field('string')
		declare memo: string;
	}
}
export const TableMap = {};
export interface TableTypes {}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any;
export type TableNames = keyof TableTypes;
export namespace ActionParams {
	export namespace Type {}
	export interface estimatecost {}
	export interface logcreation {
		account: NameType;
		from: NameType;
		excess: AssetType;
		ram: AssetType;
		timestamp: UInt64Type;
	}
	export interface parsememo {
		memo: string;
	}
}
export interface ActionNameParams {
	estimatecost: ActionParams.estimatecost;
	logcreation: ActionParams.logcreation;
	parsememo: ActionParams.parsememo;
}
export type ActionNames = keyof ActionNameParams;
export interface ActionReturnValues {
	estimatecost: Asset;
	parsememo: Types.pair_name_authority;
}
export type ActionReturnNames = keyof ActionReturnValues;
export class Contract extends BaseContract {
	constructor(args: PartialBy<ContractArgs, 'abi' | 'account'>) {
		super({
			client: args.client,
			abi: abi,
			account: args.account || Name.from('create.gm')
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
