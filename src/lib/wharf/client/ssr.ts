import { APIClient, FetchProvider } from '@wharfkit/antelope';
import { RoborovskiClient } from '@wharfkit/roborovski';

import * as env from '$env/static/private';

// Tolerant lookup for endpoints not yet declared in every deployment's env files
const optionalEnv = env as Partial<Record<string, string>>;

import { getChainConfigByName, type ChainConfig, type ChainEndpoints } from '$lib/wharf/chains';
import { getNetwork } from '$lib/state/network.svelte';

interface GetBackendClientOptions {
	history: boolean;
	hyperion: boolean;
	headers: Record<string, string>;
}

const backendEndpoints: ChainEndpoints = {
	api: env.BACKEND_API_CHAIN,
	blocks: optionalEnv.BACKEND_API_BLOCKS,
	history: env.BACKEND_API_HISTORY,
	hyperion: env.BACKEND_API_HYPERION,
	lightapi: env.BACKEND_API_LIGHTAPI,
	metrics: env.BACKEND_API_METRICS,
	msg: optionalEnv.BACKEND_API_MSG,
	msigs: env.BACKEND_API_MSIGS,
	robo2: env.BACKEND_API_ROBO2,
	sentiment: env.BACKEND_API_SENTIMENT,
	statindex: optionalEnv.BACKEND_API_STATINDEX
};

function getMergedConfig(chain: string): ChainConfig {
	const result = getChainConfigByName(chain);
	return {
		...result,
		endpoints: {
			...result.endpoints,
			...backendEndpoints
		}
	};
}

export function getBackendClient(
	network: string,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
): APIClient {
	const config = getMergedConfig(network);
	let url = config.endpoints.api;
	if (options.hyperion && config.endpoints.hyperion) {
		url = config.endpoints.hyperion;
	} else if (options.history) {
		url = config.endpoints.history;
	}
	return new APIClient({
		provider: new FetchProvider(url, { fetch, headers: options.headers })
	});
}

// Block lookups go to a node with a full block log when one is configured.
export function getBlocksClient(network: string, fetch: typeof window.fetch): APIClient {
	const config = getMergedConfig(network);
	return new APIClient({
		provider: new FetchProvider(config.endpoints.blocks || config.endpoints.api, { fetch })
	});
}

export function getBackendNetwork(
	config: ChainConfig,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
) {
	const client = getBackendClient(config.short, fetch, options);
	return getNetwork(config, { client });
}

export function getBackendNetworkByName(
	network: string,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
) {
	const config = getMergedConfig(network);
	return getBackendNetwork(config, fetch, options);
}

export function getRobo2Client(
	network: string,
	fetch: typeof window.fetch
): RoborovskiClient | undefined {
	const config = getMergedConfig(network);
	const url = config.endpoints.robo2;
	if (!url) {
		return undefined;
	}
	const client = new APIClient({
		provider: new FetchProvider(url, { fetch })
	});
	return new RoborovskiClient(client);
}
