/* eslint-disable @typescript-eslint/no-namespace */
import { Asset, Int64, Name, Struct } from '@wharfkit/antelope';

export namespace Types {
	@Struct.type('ramtransfer')
	export class ramtransfer extends Struct {
		@Struct.field(Name)
		declare from: Name;
		@Struct.field(Name)
		declare to: Name;
		@Struct.field(Int64)
		declare bytes: Int64;
		@Struct.field('string')
		declare memo: string;
	}
	@Struct.type('logbuyram')
	export class logbuyram extends Struct {
		@Struct.field(Name)
		declare payer: Name;
		@Struct.field(Name)
		declare receiver: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
		@Struct.field(Int64)
		declare bytes: Int64;
		@Struct.field(Int64)
		declare ram_bytes: Int64;
		@Struct.field(Asset)
		declare fee: Asset;
	}
	@Struct.type('logramchange')
	export class logramchange extends Struct {
		@Struct.field(Name)
		declare owner: Name;
		@Struct.field(Int64)
		declare bytes: Int64;
		@Struct.field(Int64)
		declare ram_bytes: Int64;
	}
	@Struct.type('logsellram')
	export class logsellram extends Struct {
		@Struct.field(Name)
		declare account: Name;
		@Struct.field(Asset)
		declare quantity: Asset;
		@Struct.field(Int64)
		declare bytes: Int64;
		@Struct.field(Int64)
		declare ram_bytes: Int64;
		@Struct.field(Asset)
		declare fee: Asset;
	}
	@Struct.type('logsystemfee')
	export class logsystemfee extends Struct {
		@Struct.field(Name)
		declare protocol: Name;
		@Struct.field(Asset)
		declare fee: Asset;
		@Struct.field('string')
		declare memo: string;
	}
}
