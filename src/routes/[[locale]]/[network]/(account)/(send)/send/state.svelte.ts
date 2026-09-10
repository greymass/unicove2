import { TokenBalance, TokenDefinition } from '$lib/types/token';
import { calculateValue } from '$lib/utils';
import { Asset, Name, Serializer } from '@wharfkit/antelope';

export const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
export const defaultQuantity = Asset.fromUnits(0, defaultSymbol);
export const defaultBalance = TokenBalance.from({
	balance: defaultQuantity,
	token: {
		id: TokenDefinition.from({
			chain: '0000000000000000000000000000000000000000000000000000000000000000',
			contract: '',
			symbol: defaultSymbol
		})
	}
});

export class SendState {
	public from: Name = $state(Name.from(''));
	public to: Name = $state(Name.from(''));
	public quantity: Asset = $state(defaultQuantity);
	public memo: string = $state('');

	public balance: TokenBalance = $state(defaultBalance);
	public price: Asset | undefined = $state();
	public value: Asset | undefined = $derived(
		this.price ? calculateValue(this.quantity, this.price) : undefined
	);

	public min: number | undefined = $derived(
		this.balance ? Asset.fromUnits(1, this.balance.balance.symbol).value : undefined
	);
	public max: number | undefined = $derived(this.balance ? this.balance.balance.value : undefined);

	constructor(initialBalance?: TokenBalance) {
		if (initialBalance) {
			this.balance = initialBalance;
			this.quantity = Asset.fromUnits(0, initialBalance.balance.symbol);
		}
	}

	setBalance(balance: TokenBalance) {
		this.balance = balance;
		this.quantity = Asset.fromUnits(0, balance.token.symbol);
	}

	toJSON() {
		return Serializer.objectify({
			from: this.from,
			to: this.to,
			quantity: this.quantity,
			memo: this.memo
		});
	}
}
