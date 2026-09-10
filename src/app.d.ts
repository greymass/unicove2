import type { NetworkState } from '$lib/state/network.svelte';

declare global {
	namespace App {
		interface Locals {
			locale: string;
			network: NetworkState;
		}
		interface Error {
			code?: string;
			title?: string;
			subtitle?: string;
		}
	}
}

export {};
