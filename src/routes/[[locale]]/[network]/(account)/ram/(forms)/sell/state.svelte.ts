import { Asset, Name, Serializer, Int64 } from '@wharfkit/antelope';
import { type ChainDefinition } from '@wharfkit/common';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultTokens = Asset.fromUnits(0, defaultSymbol);

export class SellRAMState {
	public account: Name = $state(defaultName);
	public bytes: number | undefined = $state(0);
	public tokens: Asset = $state(defaultTokens);
	public max: number = $state(0);
	public chain: ChainDefinition = $state() as ChainDefinition;
	public pricePerKB: Asset = $state(defaultTokens);
	public format: 'asset' | 'bytes' = $state('asset');

	public maxInKBs: Asset = $derived(Asset.fromUnits(this.max, '3,KB'));

	public bytesToSell: number | undefined = $derived(
		this.format === 'asset' && this.pricePerKB.value
			? Math.floor((this.tokens.value / this.pricePerKB.value) * 1000)
			: this.bytes || 0
	);

	public kbsToSell: Asset | undefined = $derived(Asset.fromUnits(this.bytesToSell || 0, '3,KB'));

	public maxValue: Asset = $derived(
		Asset.from(this.max * this.pricePerKB.value, this.pricePerKB.symbol)
	);

	public bytesValue: Asset = $derived(
		this.format === 'bytes' && this.bytes !== undefined && this.pricePerKB.value
			? Asset.from(
					(this.bytes * this.pricePerKB.value) / 1000,
					this.chain.systemToken?.symbol || '0,UNKNOWN'
				)
			: this.tokens
	);

	public fee: Asset = $derived(
		Asset.from(this.bytesValue.value * 0.005, this.chain.systemToken?.symbol || '0,UNKNOWN')
	);

	public expectedToReceive: Asset = $derived(
		Asset.fromUnits(
			this.bytesValue.units.subtracting(this.fee.units),
			this.chain.systemToken?.symbol || '0,UNKNOWN'
		)
	);

	public insufficientRAMForSale: boolean = $derived(
		this.bytes !== undefined && this.bytes > this.max
	);

	public insufficientRAM: boolean = $derived(!!this.max && this.insufficientRAMForSale);

	public valid: boolean = $derived(
		!!(this.bytes !== undefined && this.bytes > 0 && !this.insufficientRAM)
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
		return Serializer.objectify({
			account: this.account,
			bytes: Int64.from(this.format === 'bytes' ? this.bytes || 0 : this.bytesToSell)
		});
	}
}
