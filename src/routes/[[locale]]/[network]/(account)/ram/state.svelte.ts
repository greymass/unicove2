import { Asset } from '@wharfkit/antelope';
import { type ChainDefinition } from '@wharfkit/common';

const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);
const kbSymbol = Asset.Symbol.from('3,KB');
const defaultKBAmount = Asset.fromUnits(0, kbSymbol);

export class RAMCalculatorState {
	public tokens: Asset = $state(defaultQuantity);
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
			? this.tokens
			: Asset.from(
					((this.bytes || 0) * this.pricePerKB.value) / 1000,
					this.chain.systemToken?.symbol || '0,UNKNOWN'
				)
	);

	public kbs: Asset = $derived(
		this.bytes ? Asset.from(this.bytes / 1000, kbSymbol) : defaultKBAmount
	);

	public fee: Asset = $derived(
		Asset.from(this.bytesValue.value * 0.005, this.chain.systemToken?.symbol || '0,UNKNOWN')
	);

	constructor(chain: ChainDefinition) {
		this.chain = chain;
		this.reset();
	}

	reset() {
		this.bytes = undefined;
		this.tokens = Asset.fromUnits(0, this.chain.systemToken?.symbol || '0,UNKNOWN');
	}

	setAssetAmount(amount: Asset) {
		this.format = 'asset';
		this.tokens = amount;
		this.bytes = this.expectedBytes;
	}

	setBytesAmount(bytes: number) {
		this.format = 'bytes';
		this.bytes = bytes;
		this.tokens = this.bytesValue;
	}
}
