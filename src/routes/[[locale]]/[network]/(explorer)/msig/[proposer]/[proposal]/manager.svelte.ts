import {
	ABI,
	Name,
	PermissionLevel,
	Serializer,
	type Action,
	type Checksum256,
	type Transaction
} from '@wharfkit/antelope';
import dayjs from 'dayjs';
import { invalidateAll } from '$app/navigation';

import type { UnicoveContext } from '$lib/state/client.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import { bindingMsigAuthority, type MsigAuthority } from '$lib/wharf/msig/authority';
import * as SystemContract from '$lib/wharf/contracts/system';
import type { TransactResult } from '@wharfkit/session';
import type { SentimentPollBox } from '$lib/state/sentiment/poll.svelte';
import { applyExpectedApproval } from '$lib/state/sentiment/poll';

type ProposalStatus = 'proposed' | 'executed' | 'cancelled' | 'expired';

type Proposal = {
	proposer: string;
	name: string;
	status: ProposalStatus;
	hash: Checksum256;
	approvals: {
		provided_approvals: PermissionLevel[];
		requested_approvals: PermissionLevel[];
	};
	transaction: Transaction;
	authorities?: MsigAuthority[];
	executed_at?: string;
	executed_by?: string;
	executed_trx_id?: string;
};

interface Approvals {
	requested: PermissionLevel[];
	provided: PermissionLevel[];
}

interface DecodedAction {
	abi?: ABI;
	action: Action;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readable?: Record<string, any>;
}

export class ApprovalManager {
	network: NetworkState = $state() as NetworkState;
	wharf: WharfState = $state() as WharfState;
	proposal: Proposal;

	// States related to proposal
	result: TransactResult | null = $state(null);
	error: string | undefined = $state();
	actions: Action[] = $state([]);
	readable: DecodedAction[] = $state([]);

	expiration = $derived.by(() => this.proposal.transaction.expiration.toDate());
	expired = $derived.by(() => dayjs(this.expiration).isBefore());
	expiresIn = $derived.by(() => dayjs(this.expiration).fromNow());
	isActive = $derived.by(() => this.proposal.status === 'proposed' && !this.expired);

	private poll: SentimentPollBox;
	private initial: Approvals;

	private base = $derived.by<Approvals>(() => {
		const snapshot = this.poll.current?.approvals;
		return snapshot ? { requested: snapshot.requested, provided: snapshot.provided } : this.initial;
	});
	approvals = $derived.by<Approvals>(() => {
		const expected = this.poll.current?.expectedApproval;
		if (!expected) return this.base;
		return applyExpectedApproval(this.base.provided, this.base.requested, expected);
	});
	unreconciledApproval = $derived.by(() => this.poll.current?.unreconciledApproval ?? false);
	participants = $derived([...this.approvals.provided, ...this.approvals.requested]);
	totalRequested = $derived(this.approvals.provided.length + this.approvals.requested.length);
	totalApproved = $derived(this.approvals.provided.length);

	binding = $derived.by(() => bindingMsigAuthority(this.proposal.authorities));
	threshold = $derived(this.binding?.threshold ?? null);
	possible = $derived(this.binding?.possible ?? null);
	// Live approvals override the server snapshot; recursive verdicts survive it.
	satisfied = $derived.by(() => {
		const binding = this.binding;
		if (!binding) return null;
		const provided = new Set(this.approvals.provided.map((a) => String(a)));
		return binding.entries.reduce((sum, entry) => {
			const key = `${entry.actor}@${entry.permission}`;
			const counts =
				entry.kind === 'account'
					? provided.has(key) || (entry.approved && !this.initialProvided.has(key))
					: entry.approved;
			return counts ? sum + entry.weight : sum;
		}, 0);
	});
	approvalRatio = $derived.by(() => {
		if (this.threshold && this.satisfied !== null) {
			return Math.min(100, (this.satisfied / this.threshold) * 100);
		}
		return (this.totalApproved / this.totalRequested) * 100;
	});
	private initialProvided: Set<string>;

	inBindingRoster = (account: PermissionLevel) => {
		if (!this.binding) return true;
		return this.binding.entries.some(
			(entry) =>
				entry.kind === 'account' && `${entry.actor}@${entry.permission}` === String(account)
		);
	};

	// States related to user
	userHasApproved = $derived.by(() =>
		this.accountHasApproved(this.wharf?.session?.permissionLevel)
	);
	userIsProposer = $derived.by(() => this.wharf?.session?.actor.equals(this.proposal.proposer));
	userIsApprover = $derived.by(() =>
		this.participants.some(
			(a) => this.wharf?.session && a.equals(this.wharf?.session.permissionLevel)
		)
	);

	constructor(context: UnicoveContext, proposal: Proposal, poll: SentimentPollBox) {
		this.network = context.network;
		this.wharf = context.wharf;
		this.proposal = proposal;
		this.poll = poll;
		this.initial = {
			requested: proposal.approvals.requested_approvals,
			provided: proposal.approvals.provided_approvals
		};
		this.initialProvided = new Set(proposal.approvals.provided_approvals.map((a) => String(a)));
	}

	async sync(network: NetworkState, wharf: WharfState) {
		this.network = network;
		this.wharf = wharf;

		const overrides: Record<string, ABI> = {};
		const readable: DecodedAction[] = [];
		this.actions = this.proposal.transaction.actions;
		for (const action of this.proposal.transaction.actions) {
			// Check if an ABI override exists
			let abi: ABI | undefined = overrides[String(action.account)];

			// If not, retrieve from cache/network
			if (!abi) {
				try {
					abi = await network.abis?.getAbi(action.account);
				} catch (e) {
					console.error(e);
				}
			}

			// If unavailable, abort decoding and return raw
			if (!abi) {
				readable.push({ action });
				continue;
			}

			// Decode action data and push to readable
			const decoded = action.decodeData(abi);
			readable.push({
				action,
				abi,
				readable: {
					...action,
					data: Serializer.objectify(decoded)
				}
			});

			// If this action is a setabi, set override for future actions in loop
			if (action.account.equals('eosio') && action.name.equals('setabi')) {
				const setabi = Serializer.decode({
					type: SystemContract.Types.setabi,
					data: action.data
				});
				const decoded = Serializer.decode({
					type: ABI,
					data: setabi.abi
				});
				overrides[String(setabi.account)] = decoded;
			}
		}
		this.readable = readable;
	}

	accountHasApproved = (account?: PermissionLevel) => {
		if (!account) return false;
		return this.approvals.provided.some((a) => a.equals(account));
	};

	async approve() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const permissionLevel = this.wharf.session.permissionLevel;

		const action = this.network.contracts.msig.action('approve', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			level: permissionLevel,
			proposal_hash: this.proposal.hash
		});

		this.reset();

		this.wharf
			.transact({ action })
			.then((result) => {
				this.result = result;
				this.poll.current?.signedApproval(String(permissionLevel), true);
			})
			.catch((error) => {
				this.error = String(error);
			});
	}

	async unapprove() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const permissionLevel = this.wharf.session.permissionLevel;

		const action = this.network.contracts.msig.action('unapprove', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			level: permissionLevel
		});

		this.reset();

		this.wharf
			.transact({ action })
			.then((result) => {
				this.result = result;
				this.poll.current?.signedApproval(String(permissionLevel), false);
			})
			.catch((error) => {
				this.error = String(error);
			});
	}

	async execute() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const action = this.network.contracts.msig.action('exec', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			executer: this.wharf.session.actor
		});

		this.reset();

		this.wharf
			.transact({ action })
			.then((result) => {
				this.result = result;
				void invalidateAll();
			})
			.catch((error) => {
				this.error = String(error);
			});
	}

	async cancel() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const action = this.network.contracts.msig.action('cancel', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			canceler: this.wharf.session.actor
		});

		this.reset();

		this.wharf
			.transact({ action })
			.then((result) => {
				this.result = result;
			})
			.catch((error) => {
				this.error = String(error);
			});
	}

	reset() {
		this.result = null;
		this.error = undefined;
	}

	toJSON() {
		return {
			expiration: this.expiration,
			expired: this.expired,
			expiresIn: this.expiresIn,
			approvals: this.approvals,
			totalRequested: this.totalRequested,
			totalApproved: this.totalApproved,
			approvalRatio: this.approvalRatio,
			userHasApproved: this.userHasApproved,
			userIsProposer: this.userIsProposer,
			userIsApprover: this.userIsApprover,
			network: this.network,
			proposal: this.proposal
		};
	}
}
