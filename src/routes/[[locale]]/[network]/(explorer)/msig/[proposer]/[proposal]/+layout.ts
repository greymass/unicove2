import { Name, PermissionLevel, Transaction } from '@wharfkit/antelope';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { localizePath } from '$lib/utils/url';
import { useLocale } from '$lib/utils/intl';

export const load: LayoutLoad = async ({ data, fetch, params, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	const response = await fetch(localizePath(`/api/msig/${params.proposer}/${params.proposal}`));
	const json = await response.json();

	if ('error' in json) {
		error(404, {
			message: `No multisig proposal found.`,
			code: 'NOT_FOUND',
			title: params.proposal,
			subtitle: 'Multisig Proposal'
		});
	}

	const transaction = Transaction.from(json.transaction);

	const requested_approvals: PermissionLevel[] = json.requested_approvals.map(
		(level: PermissionLevel) => PermissionLevel.from(level)
	);

	const provided_approvals: PermissionLevel[] = json.provided_approvals.map(
		(level: PermissionLevel) => PermissionLevel.from(level)
	);

	return {
		vp: data?.vp ?? null,
		title: `${params.proposal}`,
		subtitle: `An MSIG proposed by ${params.proposer} on the ${network.chain.name} Network`,
		header: {
			copyData: params.proposal
		},
		pageMetaTags: {
			title: `${params.proposer}/${params.proposal} | Multisig on the ${network.chain.name} Network`,
			description: `Approval status, actions, and transaction data for the multisig proposal ${params.proposal} by ${params.proposer}.`
		},
		proposal: {
			approvals: {
				proposal_name: Name.from(params.proposal),
				requested_approvals,
				provided_approvals
			},
			proposer: params.proposer,
			name: params.proposal,
			status: json.status || 'proposed',
			hash: transaction.id,
			transaction,
			authorities: json.authorities ?? [],
			executed_at: json.executed_at,
			executed_by: json.executed_by,
			executed_trx_id: json.executed_trx_id
		},
		producers: json.producers
	};
};
