import { Asset, Name, Struct } from '@wharfkit/antelope';

export interface HistoricalPrice {
	date: Date;
	value: Asset;
}

export interface HistoricalPrices {
	[timeframe: string]: HistoricalPrice;
}

export type DescriptionItem = {
	key: string;
	value: string;
};

export type ActionDisplayVariants =
	| 'summary'
	| 'table'
	| 'ricardian'
	| 'pretty'
	| 'decoded'
	| 'json';

@Struct.type('account_linked_action')
export class AccountLinkedAction extends Struct {
	@Struct.field('name') declare account: Name;
	@Struct.field('name', { optional: true }) declare action?: Name;
}

@Struct.type('lightapi_balance')
export class LightAPIBalance extends Struct {
	@Struct.field(Name) declare account: Name;
	@Struct.field(Asset) declare balance: Asset;
}
