import { Name, type NameType } from '@wharfkit/antelope';
import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { ProducersState } from '$lib/state/producers.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';

export class ProducerVoteState {
	public account: AccountState | undefined;
	public producersState: ProducersState;
	public selected = $state<Set<string>>(new Set());
	private initialVotes = $state<Name[]>([]);

	constructor(account: AccountState | undefined, producersState: ProducersState) {
		this.account = account;
		this.producersState = producersState;
		this.setAccount(account);
	}

	setAccount(account: AccountState | undefined) {
		this.account = account;
		this.initialVotes = account?.voter?.votes ? [...account.voter.votes] : [];
		this.initialize();
	}

	initialize() {
		if (this.initialVotes.length > 0) {
			this.selected = new Set(this.initialVotes.map((v) => String(v)));
		} else {
			this.selected = new Set();
		}
	}

	get currentVotes(): Name[] {
		return this.initialVotes;
	}

	get selectedArray(): Name[] {
		return Array.from(this.selected)
			.map((name) => Name.from(name))
			.sort((a, b) => String(a).localeCompare(String(b)));
	}

	get validProducers(): Set<string> {
		return new Set(this.producersState.allActiveProducers.map((p) => String(p.owner)));
	}

	get hasChanges(): boolean {
		const current = new Set(this.currentVotes.map((v) => String(v)));
		if (current.size !== this.selected.size) return true;
		for (const producer of this.selected) {
			if (!current.has(producer)) return true;
		}
		return false;
	}

	get canVote(): boolean {
		return this.selected.size > 0 && this.selected.size <= 30 && this.isValidSelection;
	}

	get isValidSelection(): boolean {
		for (const producer of this.selected) {
			if (!this.validProducers.has(producer)) return false;
		}
		return true;
	}

	get addedProducers(): Name[] {
		const current = new Set(this.currentVotes.map((v) => String(v)));
		return Array.from(this.selected)
			.filter((p) => !current.has(p))
			.map((p) => Name.from(p))
			.sort((a, b) => String(a).localeCompare(String(b)));
	}

	get removedProducers(): Name[] {
		const current = this.currentVotes.map((v) => String(v));
		return current
			.filter((p) => !this.selected.has(p))
			.map((p) => Name.from(p))
			.sort((a, b) => String(a).localeCompare(String(b)));
	}

	isSelected(producer: NameType): boolean {
		return this.selected.has(String(producer));
	}

	toggleProducer(producer: NameType) {
		const producerStr = String(producer);
		if (!this.validProducers.has(producerStr)) {
			return;
		}
		const newSelected = new Set(this.selected);
		if (newSelected.has(producerStr)) {
			newSelected.delete(producerStr);
		} else {
			if (newSelected.size >= 30) {
				return;
			}
			newSelected.add(producerStr);
		}
		this.selected = newSelected;
	}

	async submitVote(wharf: WharfState, systemContract: SystemContract) {
		if (!wharf.session || !this.account) {
			throw new Error('Not logged in');
		}

		if (!this.canVote) {
			throw new Error('Cannot vote with current selection');
		}

		const action = systemContract.action('voteproducer', {
			voter: this.account.name,
			proxy: '',
			producers: this.selectedArray
		});

		const result = await wharf.transact({ action });
		return result;
	}

	get canRefresh(): boolean {
		return !this.hasChanges && this.selected.size > 0;
	}

	reset() {
		this.initialize();
	}

	/**
	 * Call after a successful vote to sync initialVotes with the current selection.
	 * This prevents the UI from resetting when closing the success modal,
	 * regardless of whether the API has returned updated data yet.
	 */
	confirmVote() {
		this.initialVotes = this.selectedArray;
	}
}
