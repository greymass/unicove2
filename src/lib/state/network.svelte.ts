import {
	Action,
	APIClient,
	Asset,
	FetchProvider,
	Int128,
	Serializer,
	UInt64,
	type ABISerializable,
	type AssetType,
	type NameType
} from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';
import { RAMState, Resources as ResourceClient, REXState, PowerUpState } from '@wharfkit/resources';
import { ABICache } from '@wharfkit/abicache';
import { MsigsClient } from '@wharfkit/msigs';

import {
	NetworkDataSources,
	type ChainConnectionState,
	type NetworkStateOptions,
	type SerializedNetworkState,
	type SystemResources
} from '$lib/types/network';

import {
	createcontract,
	getChainDefinitionFromParams,
	type ChainConfig,
	type DefaultContracts,
	type FeatureType,
	getChainConfigByName,
	legacytoken,
	systemtoken,
	ramtoken,
	wramtoken
} from '$lib/wharf/chains';

import { Token, ZeroUnits, TokenDefinition, tokenEquals } from '$lib/types/token';

import { Contract as CreateContract } from '$lib/wharf/contracts/create.gm';
import { Contract as DelphiHelperContract } from '$lib/wharf/contracts/delphihelper';
import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as ForumContract } from '$lib/wharf/contracts/forum';
import { Contract as MsgContract } from '$lib/wharf/contracts/msg';
import { Contract as MSIGContract } from '$lib/wharf/contracts/msig';
import { Contract as ReserveContract } from '$lib/wharf/contracts/eosio.reserv';
import { Contract as REXContract } from '$lib/wharf/contracts/eosio.rex';
import { Contract as SentimentContract } from '$lib/wharf/contracts/sentiment';
import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import { Contract as TimeContract } from '$lib/wharf/contracts/eosntime';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';
import { Contract as UnicoveContract } from '$lib/wharf/contracts/unicove.api';
import { Contract as VaultaContract } from '$lib/wharf/contracts/core.vaulta';
import { Contract as WRAMContract } from '$lib/wharf/contracts/eosio.wram';

import type { ObjectifiedActionData } from '$lib/types/transaction';
import {
	PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN,
	PUBLIC_FEATURE_UNICOVE_CONTRACT_API,
	PUBLIC_FEATURE_VAULTA_CORE_CONTRACT,
	PUBLIC_FEATURE_SENTIMENT_CONTRACT,
	PUBLIC_FEATURE_DISCUSSION_CONTRACT,
	PUBLIC_SYSTEM_TOKEN_CONTRACT
} from '$env/static/public';
import { localizePath } from '$lib/utils/url';
import { forumAccountFor } from '$lib/msg/model';

export class NetworkState {
	// Readonly state
	readonly client: APIClient;
	readonly chain: ChainDefinition;
	readonly config: ChainConfig;
	readonly contracts: DefaultContracts;
	readonly fetch = fetch;
	readonly msigs: MsigsClient;
	readonly snapOrigin?: string;
	readonly resourceClient: ResourceClient;

	// Raw data sources used to populate network state
	private sources?: NetworkDataSources = $state();

	// Derived network state
	readonly resources = $derived(this.getResources());
	readonly rex = $derived(this.getRexState());
	readonly token = $derived.by(() => this.getSystemToken());
	readonly legacy = $derived.by(() => this.getLegacyToken());

	// Writable state
	public abis?: ABICache = $state();
	public connection: ChainConnectionState = $state({
		connected: false,
		endpoint: '',
		updated: new Date()
	});
	public loaded = $state(false);
	public tokens: Token[] = $state([]);

	constructor(config: ChainConfig, options: NetworkStateOptions = {}) {
		this.config = config;
		this.chain = getChainDefinitionFromParams(config.short);
		this.snapOrigin = PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN;

		if (options.fetch) {
			this.fetch = options.fetch;
		}

		if (options.client) {
			this.client = options.client;
		} else {
			this.client = new APIClient(
				new FetchProvider(this.config.endpoints.api, {
					fetch: this.fetch
				})
			);
		}

		this.abis = new ABICache(this.client);
		this.resourceClient = new ResourceClient({
			api: this.client,
			sampleAccount: 'eosio.reserv',
			symbol: String(this.config.systemtoken.symbol)
		});
		this.msigs = new MsigsClient(this.client);
		this.connection.endpoint = (this.client.provider as FetchProvider).url;

		this.contracts = {
			create: new CreateContract({
				account: createcontract,
				client: this.client
			}),
			delphihelper: new DelphiHelperContract({ client: this.client }),
			delphioracle: new DelphiOracleContract({ client: this.client }),
			eosio: new SystemContract({ account: 'eosio', client: this.client }),
			eosntime: new TimeContract({ client: this.client }),
			forum: new ForumContract({
				account: forumAccountFor(PUBLIC_FEATURE_DISCUSSION_CONTRACT),
				client: this.client
			}),
			msg: new MsgContract({
				account: PUBLIC_FEATURE_DISCUSSION_CONTRACT,
				client: this.client
			}),
			msig: new MSIGContract({ client: this.client }),
			reserve: new ReserveContract({
				client: this.client
			}),
			rex: new REXContract({
				client: this.client
			}),
			sentiment: new SentimentContract({
				account: PUBLIC_FEATURE_SENTIMENT_CONTRACT,
				client: this.client
			}),
			system: new SystemContract({
				account: this.config.systemcontract,
				client: this.client
			}),
			token: new TokenContract({ account: PUBLIC_SYSTEM_TOKEN_CONTRACT, client: this.client }),
			unicove: new UnicoveContract({
				account: PUBLIC_FEATURE_UNICOVE_CONTRACT_API,
				client: this.client
			}),
			vaulta: new VaultaContract({
				account: PUBLIC_FEATURE_VAULTA_CORE_CONTRACT,
				client: this.client
			}),
			wram: new WRAMContract({
				client: this.client
			})
		};
		for (const name of Object.keys(this.contracts)) {
			const contract = this.contracts[name as keyof DefaultContracts];
			this.abis.cache.set(String(contract.account), contract.abi);
		}
	}

	get serialized(): SerializedNetworkState {
		return {
			config: this.config,
			sources: this.sources
		};
	}

	static restore(
		serialized: SerializedNetworkState,
		options: NetworkStateOptions = {}
	): NetworkState {
		const state = new NetworkState(serialized.config, options);
		if (serialized.sources) {
			state.setState(serialized.sources);
		}
		return state;
	}

	public setState(state: NetworkDataSources) {
		this.sources = NetworkDataSources.from(state);
	}

	public async refresh() {
		const response = await this.fetch(localizePath(`/api/network`));
		this.connection.updated = new Date();
		if (response.ok) {
			this.connection.connected = true;
			const json = await response.json();
			this.setState(json);
			this.loaded = true;
		} else {
			this.connection.connected = false;
		}
	}

	getRamToken(): Token {
		return Token.from(ramtoken);
	}

	getWRAMToken(): Token {
		return Token.from(wramtoken);
	}

	getSystemToken(): Token {
		const token = Token.from(systemtoken);

		if (this.sources && this.sources.token.distribution) {
			token.distribution = this.sources.token.distribution;
		}

		return token;
	}

	getLegacyToken(): Token | undefined {
		if (legacytoken) {
			const token = Token.from(legacytoken);

			if (this.sources && this.sources.legacy) {
				token.distribution = this.sources.legacy.distribution;
			}

			return token;
		}
	}

	getToken(id: TokenDefinition): Token {
		if (tokenEquals(id, systemtoken.id)) {
			return this.getSystemToken();
		}
		if (tokenEquals(id, ramtoken.id)) {
			return this.getRamToken();
		}
		if (tokenEquals(id, wramtoken.id)) {
			return this.getWRAMToken();
		}
		if (this.config.legacytoken && tokenEquals(id, this.config.legacytoken.id)) {
			return this.config.legacytoken;
		}
		return Token.from({
			id
		});
	}

	getRexState() {
		if (this.sources?.rex) {
			return REXState.from(this.sources.rex);
		}
		return this.defaultRexState;
	}

	get defaultRexState(): REXState {
		return REXState.from({
			loan_num: 0,
			namebid_proceeds: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_lendable: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_lent: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_rent: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_rex: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_unlent: Asset.fromUnits(0, this.config.systemtoken.symbol),
			version: 0
		});
	}

	supports = (feature: FeatureType): boolean => this.config.features[feature];

	tokenToRex = (token: AssetType): Asset => {
		if (!this.supports('rex')) {
			throw new Error(`The ${this} network does not support REX.`);
		}
		const asset = Asset.from(token);
		const { total_lendable, total_rex } = this.rex;
		const S1 = total_lendable.units.adding(asset.units);
		const R1 = Int128.from(S1).multiplying(total_rex.units).dividing(total_lendable.units);
		const result = R1.subtracting(total_rex.units);
		return Asset.fromUnits(result, total_rex.symbol);
	};

	rexToToken = (rex: AssetType): Asset => {
		if (!this.supports('rex')) {
			throw new Error(`The ${this} network does not support REX.`);
		}
		const asset = Asset.from(rex);
		const { total_lendable, total_rex } = this.rex;

		// Handle edge case where REX pool is empty (division by zero)
		if (total_rex.units.equals(0)) {
			return Asset.fromUnits(0, total_lendable.symbol);
		}

		const R1 = total_rex.units.adding(asset.units);
		const S1 = Int128.from(R1).multiplying(total_lendable.units).dividing(total_rex.units);
		const result = S1.subtracting(total_lendable.units);
		return Asset.fromUnits(result, total_lendable.symbol);
	};

	getPowerupFrac = (cpu: number, net: number): [number, number] => {
		if (!this.supports('powerup')) {
			throw new Error(`The ${this} network does not support powerup.`);
		}
		if (!this.sources?.powerup) {
			throw new Error('PowerUp state not initialized');
		}
		if (!this.sources?.sample) {
			throw new Error('PowerUp state not initialized');
		}
		const powerup = PowerUpState.from(this.sources?.powerup);
		return [
			Number(powerup.cpu.frac_by_ms(this.sources.sample, cpu)),
			Number(powerup.net.frac_by_kb(this.sources.sample, net))
		];
	};

	getPowerupResources = (cpu_frac: number, net_frac: number) => {
		if (!this.supports('powerup')) {
			throw new Error(`The ${this} network does not support powerup.`);
		}
		if (!this.sources?.powerup) {
			throw new Error('PowerUp state not initialized');
		}
		if (!this.sources?.sample) {
			throw new Error('PowerUp state not initialized');
		}
		const powerup = PowerUpState.from(this.sources?.powerup);
		return {
			cpu: powerup.cpu.weight_to_us(this.sources.sample.cpu, cpu_frac),
			net: powerup.net.weight_to_bytes(this.sources.sample.net, net_frac)
		};
	};

	getResources(): SystemResources {
		const defaultValue = Asset.fromUnits(0, this.token.symbol);
		const response: SystemResources = {
			cpu: {
				price: {
					powerup: defaultValue,
					rex: defaultValue,
					staking: defaultValue
				}
			},
			net: {
				price: {
					powerup: defaultValue,
					rex: defaultValue,
					staking: defaultValue
				}
			},
			ram: {
				price: {
					rammarket: defaultValue
				},
				supply: UInt64.from(ZeroUnits.value),
				gift: UInt64.from(this.sources ? this.sources.ram_gift_bytes : 0)
			}
		};

		if (this.sources?.global) {
			response.ram.supply = this.sources.global.max_ram_size;
		}

		if (this.supports('rammarket') && this.sources?.ram) {
			response.ram.price.rammarket = RAMState.from(this.sources.ram).price_per_kb(1);
		}

		if (this.supports('powerup') && this.sources?.powerup && this.sources?.sample) {
			const pstate = PowerUpState.from(this.sources.powerup);
			try {
				response.cpu.price.powerup = Asset.from(
					pstate.cpu.price_per_ms(this.sources.sample, 1),
					this.token.symbol
				);
				response.net.price.powerup = Asset.from(
					pstate.net.price_per_kb(this.sources.sample, 1),
					this.token.symbol
				);
			} catch (e) {
				console.warn('Error calculating powerup prices:', e);
			}
		}

		if (this.supports('rentrex') && this.rex && this.sources?.sample) {
			try {
				response.cpu.price.rex = Asset.from(
					this.rex.cpu_price_per_ms(this.sources.sample, 30),
					this.token.symbol
				);
				response.net.price.rex = Asset.from(
					this.rex.net_price_per_kb(this.sources.sample, 30),
					this.token.symbol
				);
			} catch (e) {
				console.warn('Error calculating REX prices:', e);
			}
		}

		if (this.supports('stakeresource') && this.sources?.sample) {
			const account = this.sources.sample.account;
			const cpuPrice = account.cpu_weight.multiplying(1000).dividing(account.cpu_limit.max);
			const netPrice = account.net_weight.multiplying(1000).dividing(account.net_limit.max);
			response.cpu.price.staking = Asset.fromUnits(cpuPrice, this.token.symbol);
			response.net.price.staking = Asset.fromUnits(netPrice, this.token.symbol);
		}

		return response;
	}

	async decodeAction(action: Action): Promise<ABISerializable> {
		const abi = await this.abis?.getAbi(action.account);
		const type = abi?.getActionType(action.name) || String(action.name);
		return Serializer.decode({
			data: action.data,
			type,
			abi: abi
		});
	}

	async objectifyAction(action: Action): Promise<ObjectifiedActionData> {
		return Serializer.objectify(await this.decodeAction(action));
	}

	async doesAccountExist(name: NameType): Promise<boolean> {
		return this.client.v1.chain
			.get_account(name)
			.then(() => true)
			.catch(() => false);
	}

	toString() {
		return this.config.short;
	}

	toJSON() {
		return {
			abis: this.abis?.cache,
			chain: this.chain,
			config: this.config,
			connection: this.connection,
			loaded: this.loaded,
			resources: this.resources,
			snapOrigin: this.snapOrigin,
			token: this.token,
			tokens: this.tokens
		};
	}
}

export function getNetwork(config: ChainConfig, options: NetworkStateOptions = {}): NetworkState {
	return new NetworkState(config, options);
}

export function getNetworkByName(name: string, fetch?: typeof window.fetch): NetworkState {
	const config = getChainConfigByName(name);
	const state = getNetwork(config, { fetch });
	return state;
}
