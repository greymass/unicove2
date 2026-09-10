import { Action, Asset, Name } from '@wharfkit/antelope';
import { PlaceholderAuth } from '@wharfkit/session';
import { ChainDefinition } from '@wharfkit/common';
import type { Contract } from '@wharfkit/contract';

import type { RentType } from './utils';
import { Types as REXTypes } from '$lib/types/rex';

const defaultName = Name.from('');
const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
const defaultQuantity = Asset.fromUnits(0, defaultSymbol);

export class RentState {
	public chain: ChainDefinition;
	public rentType: RentType;

	// rentint for self or third
	public rentingForSelf = $state(true);
	public thirdReceiver: Name = $state(defaultName);
	public thirdReceiverValid = $state(false);

	public payer: Name = $state(defaultName);
	public receiver: Name = $derived(
		this.rentingForSelf ? this.payer : this.thirdReceiverValid ? this.thirdReceiver : defaultName
	);

	public balance: Asset = $state(defaultQuantity);

	public cpuAmount: number | undefined = $state();
	public netAmount: number | undefined = $state();
	public cpuQuantity: Asset = $derived.by(() => {
		if (this.cpuPricePerMs && this.cpuAmount) {
			return Asset.from(
				Number(this.cpuPricePerMs.value) * Number(this.cpuAmount),
				this.cpuPricePerMs.symbol
			);
		}
		return Asset.from(0, this.chain.systemToken!.symbol);
	});

	public netQuantity: Asset = $derived.by(() => {
		if (this.netPricePerKb && this.netAmount) {
			return Asset.from(
				Number(this.netPricePerKb.value) * Number(this.netAmount),
				this.netPricePerKb.symbol
			);
		}
		return Asset.from(0, this.chain.systemToken!.symbol);
	});

	public cost: Asset = $derived.by(() => {
		return Asset.fromUnits(
			this.cpuQuantity.units.adding(this.netQuantity.units),
			this.cpuQuantity.symbol
		);
	});

	public cpuPricePerMs: Asset | undefined = $state();
	public netPricePerKb: Asset | undefined = $state();

	//set for powerup
	public cpuFrac: number = $state(0);
	public netFrac: number = $state(0);

	public insufficientBalance: boolean = $derived.by(() => {
		if (this.cost && this.balance) return this.cost.value > this.balance.value;
		return false;
	});

	constructor(chain: ChainDefinition, rent: RentType) {
		this.chain = chain;
		this.rentType = rent;
	}

	public valid: boolean = $derived(
		!!(
			this.cost.value &&
			this.cost.units.lte(this.balance?.units) &&
			String(this.payer) &&
			String(this.receiver)
		)
	);

	reset() {
		this.payer = defaultName;
		this.balance = defaultQuantity;
		this.cpuAmount = undefined;
		this.netAmount = undefined;
		this.cpuPricePerMs = undefined;
		this.netPricePerKb = undefined;
		this.cpuFrac = 0;
		this.netFrac = 0;
	}

	resetAfterTransction() {
		this.cpuAmount = 0;
		this.netAmount = 0;
	}

	getActions(contract: Contract): Action[] {
		switch (this.rentType) {
			case 'POWERUP':
				return this.getPowerUpActions(contract);
			case 'REX':
				return this.getRexActions(contract);
			case 'STAKE':
				return this.getStakeActions(contract);
		}
	}

	private getPowerUpActions(contract: Contract): Action[] {
		const rentData = {
			payer: this.payer,
			receiver: this.receiver,
			days: 1,
			net_frac: this.netFrac,
			cpu_frac: this.cpuFrac,
			max_payment: this.cost
		};
		return [contract.action('powerup', rentData)];
	}

	private getRexActions(contract: Contract) {
		const actions = [];
		actions.push(
			Action.from({
				account: contract.account,
				name: 'deposit',
				authorization: [PlaceholderAuth],
				data: REXTypes.deposit.from({
					owner: this.payer,
					amount: this.cost
				})
			})
		);
		if (this.cpuQuantity.value) {
			actions.push(
				Action.from({
					account: contract.account,
					name: 'rentcpu',
					authorization: [PlaceholderAuth],
					data: REXTypes.rentcpu.from({
						from: this.payer,
						receiver: this.receiver,
						loan_payment: this.cpuQuantity,
						loan_fund: Asset.fromUnits(0, this.chain.systemToken!.symbol)
					})
				})
			);
		}

		if (this.netQuantity.value) {
			actions.push(
				Action.from({
					account: contract.account,
					name: 'rentnet',
					authorization: [PlaceholderAuth],
					data: REXTypes.rentcpu.from({
						from: this.payer,
						receiver: this.receiver,
						loan_payment: this.netQuantity,
						loan_fund: Asset.fromUnits(0, this.chain.systemToken!.symbol)
					})
				})
			);
		}
		return actions;
	}

	private getStakeActions(contract: Contract): Action[] {
		const cpuQuantity = this.cpuQuantity || Asset.fromUnits(0, this.chain.systemToken!.symbol);
		const netQuantity = this.netQuantity || Asset.fromUnits(0, this.chain.systemToken!.symbol);
		const rentData = {
			from: this.payer,
			receiver: this.receiver,
			stake_cpu_quantity: cpuQuantity,
			stake_net_quantity: netQuantity,
			transfer: false
		};
		return [contract.action('delegatebw', rentData)];
	}

	getDebugInfo() {
		return [
			['rentType', this.rentType],
			['balance', this.balance],
			['payer', this.payer],
			['receiver', this.receiver],
			['rentingForSelf', this.rentingForSelf],
			['thirdReceiver', this.thirdReceiver],
			['thirdReceiverValid', this.thirdReceiverValid],
			['valid', this.valid],
			['cpuAmount', this.cpuAmount || ''],
			['netAmount', this.netAmount || ''],
			['cpuFrac', this.cpuFrac || ''],
			['netFrac', this.netFrac || '']
		];
	}
}
