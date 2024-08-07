import { API, APIClient, Asset, Int128, Name, UInt64, type NameType } from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';
import { getContext, setContext } from 'svelte';
import * as SystemContract from '$lib/wharf/contracts/system';

import { chainMapper } from '$lib/wharf/chains';
import type { ChainDefinitionType } from '@wharfkit/session';
import { getNetwork, NetworkState } from '../network.svelte';
import type { REXState } from '@wharfkit/resources';

interface LightAPIBalanceResponse {
	currency: string;
	contract: string;
	amount: string;
	decimals: string;
}

interface TokenBalance {
	asset: Asset;
	contract: Name;
}

interface DataSources {
	get_account?: API.v1.AccountObject | undefined;
	light_account: LightAPIBalanceResponse[];
	delegated: SystemContract.Types.delegated_bandwidth[];
	rex?: SystemContract.Types.rex_balance;
}

const defaultDataSources = {
	get_account: undefined,
	light_account: [],
	delegated: [],
	rex: undefined
};

export class AccountState {
	public client?: APIClient = $state();
	public fetch = $state(fetch);

	public network: NetworkState | undefined;
	public sources: DataSources = $state(defaultDataSources);

	public chain: ChainDefinition | undefined = $state();
	public name: Name | undefined = $state();
	public last_update: Date = $state(new Date());
	public loaded: boolean = $state(false);

	public balance = $derived(getBalance(this.network, this.sources, this.fetch));
	public balances = $derived(getBalances(this.sources));
	public delegations = $derived(getDelegations(this.sources));
	public delegated = $derived(getDelegated(this.delegations, this.balance.symbol));

	constructor(fetchOverride?: typeof fetch) {
		if (fetchOverride) {
			this.fetch = fetchOverride;
		}
	}

	static async for(chain: ChainDefinition, name: NameType, fetchOverride?: typeof fetch) {
		const state = new AccountState(fetchOverride);
		await state.load(chain, name);
		state.refresh();
		return state;
	}

	async load(chain: ChainDefinitionType, name: NameType) {
		this.chain = ChainDefinition.from(chain);
		this.name = Name.from(name);
		this.network = getNetwork(this.chain, this.fetch);
		await this.refresh();
		this.loaded = true;
	}

	async clear() {
		this.last_update = new Date();
		this.sources = defaultDataSources;
		this.name = undefined;
		this.chain = undefined;
		this.network = undefined;
		this.loaded = false;
	}

	async refresh() {
		const response = await this.fetch(
			`/api/${chainMapper.toShortName(String(this.chain.id))}/account/${this.name}`
		);
		const json = await response.json();
		this.last_update = new Date();
		this.sources = {
			get_account: json.account_data,
			light_account: json.balances,
			delegated: json.delegated,
			rex: json.rex
		};
	}

	toJSON() {
		return {
			last_update: this.last_update,
			chain: this.chain,
			name: this.name,
			balance: this.balance,
			balances: this.balances,
			delegated: this.delegated,
			delegations: this.delegations,
			sources: this.sources
		};
	}
}

export function getBalance(
	network: NetworkState,
	sources: DataSources,
	fetchOverride?: typeof fetch
): Asset {
	if (!sources.get_account) {
		return Asset.from('0.0000 ERROR');
	}

	// Create an empty balance to start adding to
	let balance = Asset.fromUnits(0, network.config.symbol);

	// Add the core balance if it exists on the account
	if (sources.get_account.core_liquid_balance) {
		balance = Asset.from(sources.get_account.core_liquid_balance);
	}

	// Add any delegated tokens to the total balance
	if (sources.delegated.length > 0) {
		const delegated = getDelegated(getDelegations(sources), balance.symbol);
		balance.units.add(delegated.units);
	}

	// Add any staked (REX) tokens to total balance based on current value
	if (sources.rex) {
		if (network.config.features.rex && network.rexstate) {
			const rexValue = convertRexToToken(sources.rex.rex_balance, network.rexstate);
			balance.units.add(rexValue.units);
		}
	}

	return balance;
}

export function getBalances(sources: DataSources): TokenBalance[] {
	const balances = sources.light_account.map((result) => {
		const asset = Asset.from(`${result.amount} ${result.currency}`);
		const contract = Name.from(result.contract);
		return { asset, contract };
	});

	return balances;
}

export function getDelegated(
	delegations: SystemContract.Types.delegated_bandwidth[],
	symbol: Asset.SymbolType
): Asset {
	const delegatedUnits = delegations.reduce((acc: UInt64, delegation) => {
		acc.add(delegation.net_weight.units);
		acc.add(delegation.cpu_weight.units);
		return acc;
	}, UInt64.from(0));
	return Asset.fromUnits(delegatedUnits, symbol);
}

export function getDelegations(sources: DataSources): SystemContract.Types.delegated_bandwidth[] {
	const { delegated_bandwidth } = SystemContract.Types;
	return sources.delegated.map((delegation) => delegated_bandwidth.from(delegation));
}

export function convertTokenToRex(input: Asset, state: REXState) {
	const asset = Asset.from(input);
	const S1 = state.total_lendable.units.adding(asset.units);
	const R1 = Int128.from(S1)
		.multiplying(state.total_rex.units)
		.dividing(state.total_lendable.units);
	const result = R1.subtracting(state.total_rex.units);
	return Asset.fromUnits(result, state.total_rex.symbol);
}

export function convertRexToToken(input: Asset, state: REXState) {
	const asset = Asset.from(input);
	const R1 = state.total_rex.units.adding(asset.units);
	const S1 = Int128.from(R1)
		.multiplying(state.total_lendable.units)
		.dividing(state.total_rex.units);
	const result = S1.subtracting(state.total_lendable.units);
	return Asset.fromUnits(result, state.total_lendable.symbol);
}

const contextKey = 'account';
export function getAccount(fetchOverride?: typeof fetch): AccountState {
	if (!getContext(contextKey)) {
		setContext(contextKey, new AccountState(fetchOverride));
	}
	return getContext(contextKey);
}
