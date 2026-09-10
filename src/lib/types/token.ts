import {
	Asset,
	Checksum256,
	Name,
	Serializer,
	Struct,
	TimePointSec,
	UInt64,
	type NameType
} from '@wharfkit/antelope';

export const ZeroUnits = UInt64.from(0);

@Struct.type('token_definition')
export class TokenDefinition extends Struct {
	@Struct.field(Asset.Symbol) declare symbol: Asset.Symbol;
	@Struct.field(Checksum256, { optional: true }) declare chain?: Checksum256;
	@Struct.field(Name, { optional: true }) declare contract?: Name;

	get url(): string {
		return `${this.contract}/${String(this.symbol).toLowerCase()}`;
	}
}

// Accepts a JSON array or the legacy ABI-encoded hex of token_definition[]
export function parseTokenDefinitions(value?: string): TokenDefinition[] {
	if (!value) return [];
	const trimmed = value.trim();
	if (trimmed.startsWith('[')) {
		return JSON.parse(trimmed).map((token: unknown) => TokenDefinition.from(token));
	}
	return Serializer.decode({
		type: 'token_definition[]',
		customTypes: [TokenDefinition],
		data: trimmed
	}) as TokenDefinition[];
}

@Struct.type('distribution')
export class TokenDistribution extends Struct {
	@Struct.field(Asset) declare circulating: Asset;
	@Struct.field(Asset) declare locked: Asset;
	@Struct.field(Asset) declare staked: Asset;
	@Struct.field(Asset) declare supply: Asset;
	@Struct.field(Asset) declare max: Asset;
}

export interface TokenType {
	id: TokenDefinition;
	distribution?: TokenDistribution;
	marketcap?: Asset;
}

@Struct.type('token_media_asset')
export class TokenMediaAsset extends Struct {
	@Struct.field('string', { optional: true }) declare light?: string;
	@Struct.field('string', { optional: true }) declare dark?: string;
}

@Struct.type('token_media')
export class TokenMedia extends Struct {
	@Struct.field(TokenMediaAsset, { optional: true }) declare logo?: TokenMediaAsset;
}

@Struct.type('token')
export class Token extends Struct {
	@Struct.field(TokenDefinition) declare id: TokenDefinition;
	@Struct.field(TokenDistribution, { optional: true })
	declare distribution?: TokenDistribution;
	@Struct.field(TokenMedia, { optional: true }) declare media?: TokenMedia;

	get chain(): Checksum256 | undefined {
		return this.id.chain;
	}

	get contract(): Name | undefined {
		return this.id.contract;
	}

	get name(): string {
		return this.id.symbol.name;
	}

	get symbol(): Asset.Symbol {
		return this.id.symbol;
	}

	// marketcap(symbol: Asset.Symbol): Asset {
	// 	const units = this.distribution?.circulating?.units.multiply(this.price) || 0;
	// 	return Asset.fromUnits(units, symbol);
	// }
}

@Struct.type('token_pair')
export class TokenPair extends Struct {
	@Struct.field(Token) declare base: Token;
	@Struct.field(Token) declare quote: Token;
	@Struct.field(Asset) declare price: Asset;
	@Struct.field(TimePointSec) declare updated: TimePointSec;

	get reversed(): TokenPair {
		return new TokenPair({
			base: this.quote,
			quote: this.base,
			price: Asset.fromFloat(this.price.value ? 1 / this.price.value : 0, this.base.symbol),
			updated: this.updated
		});
	}
}

@Struct.type('token_swap_fee')
export class TokenSwapFee extends Struct {
	@Struct.field(Token) declare token: Token;
	// This swap incurs a percentage fee of 0.5% matching the system contract
	@Struct.field('bool', { optional: true }) declare ramfee?: boolean;
}

@Struct.type('token_swap')
export class TokenSwap extends Struct {
	@Struct.field(TokenPair) declare pair: TokenPair;
	@Struct.field(Name) declare contract: Name;
	@Struct.field(Name) declare action: Name;
	@Struct.field(TokenSwapFee, { optional: true }) declare fee?: TokenSwapFee;
	@Struct.field('bool', { optional: true }) declare reversible?: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static from(data: any): TokenSwap {
		return new this({
			...data,
			reversible: typeof data.reversible === 'boolean' ? data.reversible : true
		});
	}
}

export type TokenBalanceStates =
	// Tokens delegated during genesis or the old eosio::delegatebw action
	| 'delegated'
	// Available token balance for the account on the token contract
	| 'liquid'
	// Legacy token balance
	| 'legacy'
	// Tokens being refunded from delegated balances, claimable with eosio::refund
	| 'refunding'
	// REX balance represented as staked system tokens
	| 'staked'
	// Total balance of all owned system tokens
	| 'total'
	// System tokens idle in the eosio.rex contract (likely from eosio::sellrex)
	| 'unstaked';

@Struct.type('token_balance_base')
export class TokenBalanceBase extends Struct {
	@Struct.field(Token) declare token: Token;
	@Struct.field(Asset) declare balance: Asset;
}

@Struct.type('token_balance_child')
export class TokenBalanceChild extends TokenBalanceBase {
	@Struct.field(Name) declare name: Name;
}

@Struct.type('token_balance')
export class TokenBalance extends TokenBalanceBase {
	@Struct.field(TokenBalanceChild, { array: true, optional: true })
	declare children?: TokenBalanceChild[];
	@Struct.field('bool', { optional: true }) declare locked?: boolean;

	child(name: NameType): TokenBalanceChild {
		if (this.children) {
			const balance = this.children.find((c) => c.name.equals(name));
			if (balance) {
				return balance;
			}
		}
		return new TokenBalanceChild({
			name: Name.from(name),
			token: this.token,
			balance: Asset.fromUnits(0, this.token.symbol)
		});
	}
}

@Struct.type('token_balance_value')
export class TokenBalanceValue extends TokenBalance {
	@Struct.field(Asset) declare value: Asset;
}

@Struct.type('token_historic_price')
export class TokenHistoricPrice extends Struct {
	@Struct.field(Asset) declare value: Asset;
	@Struct.field(TimePointSec) declare date: TimePointSec;
}

@Struct.type('token_historic_prices')
export class TokenHistoricPrices extends Struct {
	@Struct.field(TokenHistoricPrice, { optional: true }) declare day?: TokenHistoricPrice;
	@Struct.field(TokenHistoricPrice, { optional: true }) declare week?: TokenHistoricPrice;
	@Struct.field(TokenHistoricPrice, { optional: true }) declare month?: TokenHistoricPrice;
	@Struct.field(TokenHistoricPrice, { optional: true }) declare quarter?: TokenHistoricPrice;
	@Struct.field(TokenHistoricPrice, { optional: true }) declare year?: TokenHistoricPrice;
}

@Struct.type('system_historic_prices')
export class SystemHistoricPrices extends Struct {
	@Struct.field(TokenHistoricPrices, { optional: true }) declare ram?: TokenHistoricPrices;
	@Struct.field(TokenHistoricPrices, { optional: true }) declare systemtoken?: TokenHistoricPrices;
}

@Struct.type('token_sources')
export class TokenDataSources extends Struct {
	@Struct.field(TimePointSec) declare ts: TimePointSec;
	@Struct.field(Asset, { optional: true }) declare mockPrice?: Asset;
	@Struct.field(TokenPair, { array: true }) declare pairs: TokenPair[];
	@Struct.field(SystemHistoricPrices, { optional: true }) declare historic?: SystemHistoricPrices;
}

export function tokenEquals(first: TokenDefinition, second: TokenDefinition) {
	return (
		String(first.chain) === String(second.chain) &&
		String(first.contract) === String(second.contract) &&
		String(first.symbol) === String(second.symbol)
	);
}
