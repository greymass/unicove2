import { APIClient, Asset, FetchProvider, Int128, type AssetType } from '@wharfkit/antelope';
import { Chains, ChainDefinition } from '@wharfkit/common';
import { RAMState, Resources, REXState } from '@wharfkit/resources';

import { Types as DelphiOracleTypes } from '$lib/wharf/contracts/delphioracle';

import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';

import { chainMapper } from '$lib/wharf/chains';
import { chainIdsToIndices } from '@wharfkit/session';

interface DefaultContracts {
	delphioracle?: DelphiOracleContract;
	token: TokenContract;
	system: SystemContract;
}

export type FeatureType = 'delphioracle' | 'lightapi' | 'rex';

interface ChainConfig {
	features: Record<FeatureType, boolean>;
	symbol: Asset.SymbolType;
}

const configs: Record<string, ChainConfig> = {
	// EOS
	aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906: {
		features: {
			delphioracle: true,
			lightapi: true,
			rex: true
		},
		symbol: '4,EOS'
	},
	// Jungle4
	'73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d': {
		features: {
			delphioracle: false,
			lightapi: false,
			rex: true
		},
		symbol: '4,EOS'
	},
	// Telos
	'4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11': {
		features: {
			delphioracle: true,
			lightapi: true,
			rex: true
		},
		symbol: '4,TLOS'
	}
};

export class NetworkState {
	public chain: ChainDefinition;
	public config: ChainConfig;
	public fetch = fetch;
	public last_update: Date = $state(new Date());
	public loaded = $state(false);

	public contracts: DefaultContracts;

	public ramstate?: RAMState = $state();
	public resources?: Resources = $state();
	public rexstate?: REXState = $state();
	public tokenstate?: DelphiOracleTypes.datapoints = $state();

	public ramprice = $derived.by(() => (this.ramstate ? this.ramstate.price_per_kb(1) : undefined));
	public rexprice = $derived.by(() => undefined);
	public tokenprice = $derived.by(() =>
		this.tokenstate ? Asset.fromUnits(this.tokenstate.median, '4,USD') : undefined
	);

	constructor(chain: ChainDefinition, fetchOverride?: typeof fetch) {
		this.chain = chain;
		this.config = configs[String(this.chain.id)];
		if (fetchOverride) {
			this.fetch = fetchOverride;
		}
		this.resources = new Resources({
			api: this.client,
			sampleAccount: 'eosio.reserv'
		});

		this.contracts = {
			token: new TokenContract({ client: this.client }),
			system: new SystemContract({ client: this.client })
		};

		if (this.config.features.delphioracle) {
			this.contracts.delphioracle = new DelphiOracleContract({ client: this.client });
		}
	}

	public get client() {
		return new APIClient(
			new FetchProvider(this.chain.url, {
				fetch: this.fetch
			})
		);
	}

	async refresh() {
		const response = await this.fetch(
			`/api/${chainMapper.toShortName(String(this.chain.id))}/network`
		);
		const json = await response.json();

		this.loaded = true;
		this.last_update = new Date();
		this.tokenstate = json.tokenstate;

		try {
			this.ramstate = RAMState.from(json.ramstate);
			this.rexstate = REXState.from(json.rexstate);
		} catch (error) {
			console.log(error);
			console.log(json);
		}
	}

	tokenToRex = (token: AssetType) => {
		if (!this.rexstate) {
			throw new Error('REX state not initialized');
		}
		const asset = Asset.from(token);
		const { total_lendable, total_rex } = this.rexstate;
		const S1 = total_lendable.units.adding(asset.units);
		const R1 = Int128.from(S1).multiplying(total_rex.units).dividing(total_lendable.units);
		const result = R1.subtracting(total_rex.units);
		return Asset.fromUnits(result, total_rex.symbol);
	};

	rexToToken = (rex: AssetType) => {
		if (!this.rexstate) {
			throw new Error('REX state not initialized');
		}
		const asset = Asset.from(rex);
		const { total_lendable, total_rex } = this.rexstate;
		const R1 = total_rex.units.adding(asset.units);
		const S1 = Int128.from(R1).multiplying(total_lendable.units).dividing(total_rex.units);
		const result = S1.subtracting(total_lendable.units);
		return Asset.fromUnits(result, total_lendable.symbol);
	};

	toJSON() {
		return {
			chain: this.chain,
			last_update: this.last_update,
			ramstate: this.ramstate,
			ramprice: this.ramprice,
			rexstate: this.rexstate,
			sampleAccount: this.resources?.sampleAccount,
			tokenprice: this.tokenprice,
			tokenstate: this.tokenstate
		};
	}
}

interface NetworkServiceInstance {
	chain: string;
	network: NetworkState;
}

const services = $state<NetworkServiceInstance[]>([]);

export function getNetwork(chain: ChainDefinition, fetchOverride?: typeof window.fetch) {
	let current = services.find((service) => service.chain === String(chain.id));
	if (!current) {
		const network = new NetworkState(chain, fetchOverride);
		current = { chain: String(chain.id), network };
		services.push(current);
	}
	return current.network;
}

export function getChainDefinitionFromParams(network?: string): ChainDefinition {
	if (network) {
		const id = chainMapper.toChainId(network);
		const name = chainIdsToIndices.get(id);
		if (name) {
			// Return the chain that's found
			return Chains[name];
		}
	}
	// Return EOS as the default network if params.network is not defined
	return Chains.EOS;
}

export function getNetworkFromParams(
	network?: string,
	fetchOverride?: typeof window.fetch
): NetworkState {
	const chain = getChainDefinitionFromParams(network);
	const state = getNetwork(chain, fetchOverride);
	return state;
}
