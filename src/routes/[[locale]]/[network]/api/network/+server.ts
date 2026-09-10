import { json } from '@sveltejs/kit';
import { Asset, Int64, type API, type AssetType } from '@wharfkit/antelope';
import type { RAMState, REXState, PowerUpState, SampleUsage } from '@wharfkit/resources';

import { getCacheHeaders } from '$lib/utils';
import { Types as DelphioracleTypes } from '$lib/wharf/contracts/delphioracle.js';
import { Types as SystemTypes } from '$lib/wharf/contracts/system';
import { Types as UnicoveTypes } from '$lib/wharf/contracts/unicove.api';
import type { NetworkState } from '$lib/state/network.svelte';
import { NetworkDataSources } from '$lib/types/network';
import type { RequestEvent } from './$types';
import { Types as REXTypes } from '$lib/types/rex';

type ResponseType =
	| Asset[]
	| API.v1.GetCurrencyStatsResponse
	| RAMState
	| REXState
	| PowerUpState
	| SampleUsage
	| DelphioracleTypes.datapoints
	| SystemTypes.eosio_global_state
	| UnicoveTypes.get_network_response
	| undefined;

async function getNativeResponse(network: NetworkState): Promise<NetworkDataSources> {
	return getNetworkNative(network);
}

async function getContractResponse(network: NetworkState): Promise<NetworkDataSources> {
	try {
		return getNetworkContract(network);
	} catch (e) {
		// Fallback to old method on failure
		console.error('getNetworkContract failure', e);
		return getNativeResponse(network);
	}
}

export async function GET({ locals: { network } }: RequestEvent) {
	let response;
	try {
		if (network.supports('unicovecontractapi')) {
			response = await getContractResponse(network);
		} else {
			response = await getNetworkNative(network);
		}
	} catch (e) {
		console.error('GET network error', e);
		return json(
			{
				ts: new Date(),
				error: String(e)
			},
			{
				status: 500
			}
		);
	}

	return json(
		{
			ts: new Date(),
			...response
		},
		{
			headers: getCacheHeaders(5)
		}
	);
}

function addRequest(list: Promise<ResponseType>[], request: Promise<ResponseType>) {
	return list.push(request) - 1;
}

function getResponse(list: ResponseType[], index: number) {
	return index >= 0 && list.length > index ? list[index] : undefined;
}

async function getNetworkNative(network: NetworkState): Promise<NetworkDataSources> {
	const requests: Promise<ResponseType>[] = [];
	let globalStateIndex = -1;
	const lockedsupplyIndexes: number[] = [];
	let ramStateIndex = -1;
	let rexStateIndex = -1;
	let powerupStateIndex = -1;
	let sampleUsageIndex = -1;
	let supplyIndex = -1;
	let tokenStateIndex = -1;

	globalStateIndex = addRequest(requests, network.contracts.system.table('global').get());

	if (network.supports('rammarket') && network.resourceClient) {
		ramStateIndex = addRequest(requests, network.resourceClient?.v1.ram.get_state());
	}
	if (network.supports('rex') && network.resourceClient) {
		rexStateIndex = addRequest(requests, network.resourceClient.v1.rex.get_state());
	}
	if (network.supports('powerup') && network.resourceClient) {
		powerupStateIndex = addRequest(requests, network.resourceClient.v1.powerup.get_state());
	}
	if (
		(network.supports('staking') || network.supports('rentrex') || network.supports('powerup')) &&
		network.resourceClient
	) {
		sampleUsageIndex = addRequest(requests, network.resourceClient.getSampledUsage());
	}
	if (network.chain.systemToken) {
		supplyIndex = addRequest(
			requests,
			network.client.v1.chain.get_currency_stats(
				network.chain.systemToken.contract,
				network.chain.systemToken.symbol.name
			)
		);
	}
	if (network.chain.systemToken && network.config.lockedsupply) {
		const systemToken = network.chain.systemToken;
		network.config.lockedsupply.forEach((account) => {
			lockedsupplyIndexes.push(
				addRequest(
					requests,
					network.client.v1.chain.get_currency_balance(
						systemToken.contract,
						account,
						systemToken.symbol.name
					)
				)
			);
		});
	}
	if (network.supports('delphioracle')) {
		const pairname = `${network.chain.systemToken!.symbol.name.toLowerCase()}usd`;
		tokenStateIndex = addRequest(
			requests,
			network.contracts.delphioracle.table('datapoints', pairname).get()
		);
	}

	const results = await Promise.all(requests);
	const ramstate = getResponse(results, ramStateIndex);
	const rexstate = getResponse(results, rexStateIndex);
	const globalstate = getResponse(results, globalStateIndex);
	const powerupstate = getResponse(results, powerupStateIndex);
	const sampleUsage = getResponse(results, sampleUsageIndex);
	const supplyResult = getResponse(results, supplyIndex) as API.v1.GetCurrencyStatsResponse;

	const lockedsupply: Asset = Asset.fromUnits(0, network.chain.systemToken!.symbol);
	lockedsupplyIndexes.forEach((lockedsupplyIndex) => {
		const response = getResponse(results, lockedsupplyIndex) as AssetType[];
		if (!response || !response.length) {
			return;
		}
		lockedsupply.units.add(Asset.from(response[0]).units);
	});

	const tokenstate = getResponse(results, tokenStateIndex);

	const index = String(network.chain.systemToken?.symbol.name);
	const supply = supplyResult[index];
	const circulating = Asset.fromUnits(
		supply.supply.units.subtracting(lockedsupply.units),
		supply.supply.symbol
	);

	const rex = rexstate as REXTypes.rex_pool;

	const token = UnicoveTypes.token.from({
		id: {
			chain: network.chain.id,
			contract: network.chain.systemToken!.contract,
			symbol: network.chain.systemToken!.symbol
		},
		distribution: {
			circulating,
			locked: lockedsupply,
			supply: supply.supply,
			staked: network.supports('rex')
				? rex.total_lendable
				: Asset.fromUnits(0, supply.supply.symbol),
			max: supply.max_supply
		}
	});

	const response = NetworkDataSources.from({
		global: SystemTypes.eosio_global_state.from(globalstate),
		token,
		ram: ramstate as SystemTypes.exchange_state,
		rex,
		sample: sampleUsage as SampleUsage,
		ram_gift_bytes: Int64.from(1400) // Not possible to get from native APIs?
	});

	if (network.supports('powerup')) {
		response.powerup = powerupstate as SystemTypes.powerup_state;
	}

	if (network.supports('delphioracle')) {
		response.oracle = tokenstate as DelphioracleTypes.datapoints;
	}

	return response;
}

async function getNetworkContract(network: NetworkState): Promise<NetworkDataSources> {
	let oracle: DelphioracleTypes.datapoints | undefined;
	let sample: SampleUsage | undefined;

	if (!network.supports('unicovecontractapi')) {
		throw new Error('Unicove contract not available');
	}

	const networkState = await network.contracts.unicove.readonly('network');

	let legacyDistribution: UnicoveTypes.token | undefined;
	if (network.config.legacytoken && network.config.legacytoken.contract) {
		legacyDistribution = await network.contracts.unicove.readonly('distribution', {
			def: {
				chain: network.chain.id,
				symbol: network.config.legacytoken.symbol,
				contract: network.config.legacytoken.contract
			}
		});
	}

	if (
		(network.supports('staking') || network.supports('rentrex') || network.supports('powerup')) &&
		network.resourceClient
	) {
		sample = await network.resourceClient.getSampledUsage();
	}

	if (network.supports('delphioracle')) {
		oracle = await network.contracts.delphioracle.table('datapoints', 'eosusd').get();
	}

	return NetworkDataSources.from({
		...networkState,
		legacy: legacyDistribution,
		oracle,
		sample
	});
}
