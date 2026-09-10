import { json } from '@sveltejs/kit';
import { APIClient, FetchProvider, Name, PackedTransaction, type API } from '@wharfkit/antelope';
import { MsigsClient } from '@wharfkit/msigs';

import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';
import * as MsigContract from '$lib/wharf/contracts/msig';
import { localizePath } from '$lib/utils/url';
import {
	resolveMsigAuthorities,
	type AuthorityDef,
	type MsigAuthority
} from '$lib/wharf/msig/authority';
import type { NetworkState } from '$lib/state/network.svelte';

type Level = { actor: unknown; permission: unknown };
type Trx = { delay_sec?: unknown; actions?: { authorization?: Level[] }[] };

async function computeAuthorities(
	network: NetworkState,
	transaction: Trx,
	provided: Level[],
	requested: Level[]
): Promise<MsigAuthority[]> {
	const toLevel = (level: Level) => ({
		actor: String(level.actor),
		permission: String(level.permission)
	});
	const accounts = new Map<string, Promise<API.v1.AccountObject | null>>();
	const getAuthority = async (actor: string, permission: string): Promise<AuthorityDef | null> => {
		let pending = accounts.get(actor);
		if (!pending) {
			pending = network.client.v1.chain.get_account(actor).catch(() => null);
			accounts.set(actor, pending);
		}
		const account = await pending;
		const match = account?.permissions.find((p) => p.perm_name.equals(permission));
		if (!match) return null;
		const auth = match.required_auth;
		return {
			threshold: Number(auth.threshold),
			keys: auth.keys.map((k) => ({ weight: Number(k.weight) })),
			waits: auth.waits.map((w) => ({
				wait_sec: Number(w.wait_sec),
				weight: Number(w.weight)
			})),
			accounts: auth.accounts.map((a) => ({
				permission: {
					actor: String(a.permission.actor),
					permission: String(a.permission.permission)
				},
				weight: Number(a.weight)
			}))
		};
	};
	try {
		return await resolveMsigAuthorities({
			authorizations: (transaction.actions ?? []).flatMap((a) =>
				(a.authorization ?? []).map(toLevel)
			),
			provided: provided.map(toLevel),
			requested: requested.map(toLevel),
			delaySec: Number(transaction.delay_sec ?? 0),
			getAuthority
		});
	} catch {
		return [];
	}
}

export async function GET({ fetch, locals: { network }, params }: RequestEvent) {
	const proposer = Name.from(params.proposer);
	const proposal_name = Name.from(params.proposal);

	const producersResponse = await fetch(localizePath(`/api/producers/top30`));
	const { producers } = await producersResponse.json();

	if (network.supports('msigapi')) {
		try {
			const msigsUrl = network.config.endpoints.msigs;
			const msigs = msigsUrl
				? new MsigsClient(new APIClient(new FetchProvider(msigsUrl, { fetch })))
				: network.msigs;
			const result = await msigs.get_proposal(proposer, proposal_name);
			const provided = result.provided_approvals || [];
			const providedSet = new Set(provided.map((a) => `${a.actor}@${a.permission}`));
			const requested = (result.requested_approvals || []).filter(
				(a) => !providedSet.has(`${a.actor}@${a.permission}`)
			);
			const authorities =
				result.status === 'proposed'
					? await computeAuthorities(network, result.transaction as Trx, provided, requested)
					: [];

			return json(
				{
					ts: new Date(),
					proposer: String(result.proposer),
					name: String(result.proposal_name),
					producers,
					status: result.status,
					transaction: result.transaction,
					requested_approvals: requested,
					provided_approvals: provided,
					authorities,
					executed_at: result.executed_at ? String(result.executed_at) : undefined,
					executed_by: result.executed_by ? String(result.executed_by) : undefined,
					executed_trx_id: result.executed_trx_id ? String(result.executed_trx_id) : undefined
				},
				{ headers: getCacheHeaders(5) }
			);
		} catch {
			// Fall through to on-chain lookup
		}
	}

	const proposalRows = await network.client.v1.chain.get_table_rows({
		code: 'eosio.msig',
		scope: proposer,
		table: 'proposal',
		json: false,
		lower_bound: proposal_name,
		upper_bound: proposal_name,
		type: MsigContract.Types.proposal
	});
	if (!proposalRows.rows.length) {
		return json({ error: 'Proposal not found' }, { status: 404 });
	}
	const proposal = proposalRows.rows[0];

	const approvals = await network.contracts.msig.table('approvals2', proposer).get(proposal_name);

	const packed = PackedTransaction.from({
		compression: false,
		signatures: [],
		packed_trx: proposal.packed_transaction,
		packed_context_free_data: []
	});
	const transaction = packed.getTransaction();

	const requested_approvals = approvals ? approvals.requested_approvals.map((a) => a.level) : [];
	const provided_approvals = approvals ? approvals.provided_approvals.map((a) => a.level) : [];
	const authorities = await computeAuthorities(
		network,
		transaction as unknown as Trx,
		provided_approvals,
		requested_approvals
	);

	return json(
		{
			ts: new Date(),
			proposer: params.proposer,
			name: params.proposal,
			producers,
			status: 'proposed',
			transaction,
			requested_approvals,
			provided_approvals,
			authorities
		},
		{ headers: getCacheHeaders(5) }
	);
}
