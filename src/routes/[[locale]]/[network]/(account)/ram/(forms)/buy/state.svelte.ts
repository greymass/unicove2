import { Asset, Name, Serializer, Int64 } from '@wharfkit/antelope';
import { type ChainDefinition } from '@wharfkit/common';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);
const kbSymbol = Asset.Symbol.from('3,KB');
const defaultKBAmount = Asset.fromUnits(0, kbSymbol);

export class BuyRAMState {
	public payer: Name = $state(defaultName);
	public receiver: Name = $state(defaultName);
	public tokens: Asset = $state(defaultQuantity);
	public balance: Asset = $state(defaultQuantity);
	public chain: ChainDefinition = $state() as ChainDefinition;
	public pricePerKB: Asset = $state(defaultQuantity);
	public format: 'asset' | 'bytes' = $state('asset');

	public bytes: number | undefined = $state();

	public pricePerByte: Asset = $derived(
		Asset.fromUnits(Number(this.pricePerKB.units) / 1000, this.pricePerKB.symbol)
	);

	public expectedBytes: number | undefined = $derived(
		this.format === 'asset' && this.pricePerKB.value
			? Math.round((this.tokens.value / this.pricePerKB.value) * 1000)
			: this.bytes
	);

	public bytesValue: Asset = $derived(
		this.format === 'asset' || !this.pricePerKB.value
			? Asset.from(this.tokens.value * 0.995, this.chain.systemToken?.symbol || '0,UNKNOWN')
			: Asset.from(
					((this.bytes || 0) * this.pricePerKB.value) / 1000,
					this.chain.systemToken?.symbol || '0,UNKNOWN'
				)
	);

	public kbs: Asset = $derived(
		this.bytes ? Asset.from(this.bytes / 1000, kbSymbol) : defaultKBAmount
	);

	public fee: Asset = $derived(
		Asset.from(
			(this.format === 'asset' ? this.tokens.value : this.bytesValue.value) * 0.005,
			this.chain.systemToken?.symbol || '0,UNKNOWN'
		)
	);

	public bytesCost: Asset = $derived(
		this.format === 'asset'
			? this.tokens
			: Asset.fromUnits(
					this.bytesValue.units.adding(this.fee.units),
					this.chain.systemToken?.symbol || '0,UNKNOWN'
				)
	);

	public valid: boolean = $derived(
		!!(
			((this.format === 'bytes' && this.bytes) ||
				(this.format === 'asset' && this.tokens.value > 0)) &&
			this.bytesCost.units.lte(this.balance.units) &&
			this.payer.value &&
			this.receiver.value
		)
	);

	public insufficientBalance: boolean = $derived(
		!!this.balance.value && this.bytesValue.value > this.balance.value
	);

	constructor(chain: ChainDefinition) {
		this.chain = chain;
		this.reset();
	}

	reset() {
		this.bytes = undefined;
		this.tokens = Asset.fromUnits(0, this.chain.systemToken?.symbol || '0,UNKNOWN');
	}

	toJSON() {
		if (this.format === 'asset') {
			return Serializer.objectify({
				payer: this.payer,
				receiver: this.receiver,
				quant: this.bytesCost
			});
		} else {
			return Serializer.objectify({
				payer: this.payer,
				receiver: this.receiver,
				bytes: Int64.from(this.bytes || 0)
			});
		}
	}

	setBalance(balance: Asset) {
		this.balance = balance;
	}
}
