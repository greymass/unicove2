import { BlockTimestamp } from '@wharfkit/antelope';

import { Types } from '$lib/wharf/contracts/system';
import type { NetworkState } from './network.svelte';

export interface BidnameApiResponse {
	ts: string;
	lastNameClose?: unknown;
	topBids?: unknown[];
	trackedBids?: { name: string; bid: unknown; refund: unknown; accountExists?: boolean }[];
	searchResult?: { name: string; bid: unknown; accountExists: boolean };
	error?: string;
}

export class BidnameState {
	topBids: Types.name_bid[] = $state([]);
	lastNameClose: BlockTimestamp | undefined = $state(undefined);
	loading = $state(false);
	error: string | undefined = $state(undefined);

	leadingBid = $derived(this.topBids[0]);

	private network: NetworkState;

	constructor(network: NetworkState) {
		this.network = network;
	}

	async fetchAll(params: {
		top?: number;
		names?: string[];
		account?: string;
	}): Promise<BidnameApiResponse | undefined> {
		const searchParams = new URLSearchParams();
		if (params.top) searchParams.set('top', String(params.top));
		if (params.names?.length) searchParams.set('names', params.names.join(','));
		if (params.account) searchParams.set('account', params.account);

		const url = `/en/${this.network.config.short}/api/bidname?${searchParams}`;

		if (this.topBids.length === 0) {
			this.loading = true;
		}
		this.error = undefined;

		try {
			const res = await this.network.fetch(url);
			if (!res.ok) throw new Error(`API request failed: ${res.status}`);
			const data: BidnameApiResponse = await res.json();
			if (data.error) throw new Error(data.error);

			if (data.topBids) {
				this.topBids = data.topBids.map((b) => Types.name_bid.from(b));
			}
			if (data.lastNameClose !== undefined) {
				this.lastNameClose = data.lastNameClose
					? BlockTimestamp.from(data.lastNameClose as string)
					: undefined;
			}

			return data;
		} catch (e) {
			this.error = String(e);
			return undefined;
		} finally {
			this.loading = false;
		}
	}
}
