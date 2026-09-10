import { Checksum256 } from '@wharfkit/antelope';
import { browser } from '$app/environment';
import type { NetworkState } from '../network.svelte';
import type { SearchRecord } from './types';

/**
 * Persistent storage for search history.
 * Stores recent search records in localStorage, scoped by chain ID.
 */
export class SearchRecordStorage {
	private records = $state<SearchRecord[]>([]) as SearchRecord[];
	chainId: Checksum256;
	maxLength: number;
	storageKey = 'records';

	constructor(network: NetworkState, maxLength = 10) {
		this.chainId = network.chain.id;
		this.maxLength = maxLength;
		if (browser) {
			const item = localStorage.getItem(this.makeStorageKey());
			if (item) this.records = this.deserialize(item);
		}
	}

	private makeStorageKey(): string {
		return `${this.storageKey}-${this.chainId}`;
	}

	private serialize(value: SearchRecord[]): string {
		return JSON.stringify(value);
	}

	private deserialize(item: string): SearchRecord[] {
		return JSON.parse(item);
	}

	private save() {
		if (browser) {
			localStorage.setItem(this.makeStorageKey(), this.serialize(this.records));
		}
	}

	/**
	 * Add a search record to history.
	 * If the record already exists (by URL), it's moved to the top.
	 */
	add(s: SearchRecord) {
		const exists = this.records.findIndex((r) => r.url === s.url);
		if (exists >= 0) {
			this.records.splice(exists, 1);
		}
		this.records.unshift(s);
		if (this.records.length > this.maxLength) {
			this.records.splice(this.maxLength);
		}
		this.save();
	}

	/**
	 * Remove a record at the given index
	 */
	remove(i: number) {
		this.records.splice(i, 1);
		this.save();
	}

	/**
	 * Get all stored records
	 */
	get(): SearchRecord[] {
		return this.records;
	}

	/**
	 * Clear all stored records
	 */
	clear() {
		this.records = [];
		this.save();
	}
}

/**
 * Search history records by matching against the query
 */
export function searchHistory(query: string, recentHistory: SearchRecordStorage): SearchRecord[] {
	const history = recentHistory.get();
	return history
		.filter((r) => r.type !== 'page')
		.filter((r) => r.value.includes(query.trim().toLowerCase()));
}
