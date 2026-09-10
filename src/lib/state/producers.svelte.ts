import type { NetworkState } from '$lib/state/network.svelte';
import * as SystemContract from '$lib/wharf/contracts/system';
import { Name, type NameType } from '@wharfkit/antelope';

export class ProducersState {
	public network: NetworkState;
	public producers = $state<SystemContract.Types.producer_info[]>([]);
	public loading = $state(false);
	public error = $state<string | null>(null);
	public showAll = $state(false);

	constructor(network: NetworkState) {
		this.network = network;
	}

	async loadProducers(): Promise<void> {
		this.loading = true;
		this.error = null;
		try {
			const networkShort = this.network.config.short;
			const response = await this.network.fetch(`/en/${networkShort}/api/producers`);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}
			const data = await response.json();
			this.producers = data.producers;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load producers';
			console.error('Error loading producers:', e);
		} finally {
			this.loading = false;
		}
	}

	get allActiveProducers() {
		return this.producers
			.filter((p) => p.is_active && Number(p.total_votes) > 0)
			.toSorted((a, b) => Number(b.total_votes) - Number(a.total_votes));
	}

	get activeProducers() {
		return this.showAll ? this.allActiveProducers : this.allActiveProducers.slice(0, 100);
	}

	get hasMore() {
		return this.allActiveProducers.length > 100;
	}

	loadMore() {
		this.showAll = true;
	}

	get top21() {
		return this.allActiveProducers.slice(0, 21);
	}

	get standby() {
		return this.allActiveProducers.slice(21);
	}

	get totalVotes() {
		return this.allActiveProducers.reduce((acc, p) => acc + Number(p.total_votes), 0);
	}

	get statistics() {
		const top21Threshold =
			this.allActiveProducers.length >= 21 ? Number(this.allActiveProducers[20].total_votes) : 0;
		return {
			totalActive: Number(this.allActiveProducers.length),
			totalVotes: Number(this.totalVotes || 0),
			top21Threshold: Number(top21Threshold || 0)
		};
	}

	isProducer(accountName: NameType): boolean {
		const name = Name.from(accountName);
		return this.allActiveProducers.some((p) => name.equals(p.owner));
	}

	isTop21(accountName: NameType): boolean {
		const name = Name.from(accountName);
		return this.top21.some((p) => name.equals(p.owner));
	}
}
