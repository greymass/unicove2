import { bindingMsigAuthority, type MsigAuthority } from '$lib/wharf/msig/authority';
import type { VpIndex, VpMsigStatus, VpSummary } from './types';

export interface VpMsigStep {
	step: number;
	index: number;
	title: string | null;
	proposer: string | null;
	proposal: string | null;
	status: VpMsigStatus;
	msigPath: string | null;
	txPath: string | null;
	live: boolean;
	planned: boolean;
	supersededAttempts: number;
}

function msigKey(proposer: string | undefined, proposal: string | undefined): string {
	return `${proposer ?? ''}/${proposal ?? ''}`;
}

export function vpMsigSteps(summary: VpSummary, lang?: string): VpMsigStep[] {
	const translated = new Map<number, string>();
	if (lang && lang !== 'en') {
		const match = summary.translations.find((t) => t.lang === lang);
		for (const entry of match?.msigs ?? []) {
			translated.set(entry.step, entry.title);
		}
	}

	// An entry that some later entry supersedes is a retried attempt, not a step of its own.
	const retryCount = new Map<string, number>();
	const replaced = new Set<string>();
	for (const msig of summary.msigs) {
		if (!msig.supersedes) continue;
		replaced.add(msigKey(msig.supersedes.proposer, msig.supersedes.proposal));
	}

	const steps: VpMsigStep[] = [];
	summary.msigs.forEach((msig, index) => {
		const key = msigKey(msig.proposer, msig.proposal);
		if (msig.supersedes) {
			const target = msigKey(msig.supersedes.proposer, msig.supersedes.proposal);
			retryCount.set(key, (retryCount.get(target) ?? 0) + 1);
		}
		if (replaced.has(key)) return;
		const planned = msig.status === 'planned';
		steps.push({
			step: steps.length + 1,
			index,
			title: translated.get(index + 1) ?? msig.title ?? null,
			proposer: msig.proposer ?? null,
			proposal: msig.proposal ?? null,
			status: msig.status,
			msigPath: planned ? null : `/msig/${msig.proposer}/${msig.proposal}`,
			txPath: msig.status === 'executed' && msig.txid ? `/transaction/${msig.txid}` : null,
			live: msig.status === 'active',
			planned,
			supersededAttempts: retryCount.get(key) ?? 0
		});
	});
	return steps;
}

export interface VpMsigApprovals {
	approved: number;
	requested: number;
	satisfied: number | null;
	threshold: number | null;
	possible: number | null;
	expiration: string | null;
	actions: string[];
}

export function parseMsigApprovals(json: unknown): VpMsigApprovals | null {
	if (!json || typeof json !== 'object' || 'error' in json) return null;
	const row = json as {
		provided_approvals?: unknown[];
		requested_approvals?: unknown[];
		authorities?: MsigAuthority[];
		transaction?: { expiration?: string; actions?: { account: string; name: string }[] };
	};
	if (!Array.isArray(row.provided_approvals)) return null;
	const approved = row.provided_approvals.length;
	const binding = bindingMsigAuthority(row.authorities);
	return {
		approved,
		requested: approved + (row.requested_approvals?.length ?? 0),
		satisfied: binding?.satisfied ?? null,
		threshold: binding?.threshold ?? null,
		possible: binding?.possible ?? null,
		expiration: row.transaction?.expiration ?? null,
		actions: (row.transaction?.actions ?? []).map((a) => `${a.account}::${a.name}`)
	};
}

export function sentimentTopicPath(ref: { contract: string; topic: string }): string {
	return `/sentiment/topics/${ref.topic}`;
}

export function vpForMsig(index: VpIndex, proposer: string, proposal: string): VpSummary | null {
	for (const summary of index.proposals) {
		for (const msig of summary.msigs) {
			if (msig.proposer === proposer && msig.proposal === proposal) {
				return summary;
			}
		}
	}
	return null;
}

export function vpForTopic(index: VpIndex, topic: string): VpSummary | null {
	for (const summary of index.proposals) {
		for (const ref of summary.sentiment) {
			if (ref.topic === topic) {
				return summary;
			}
		}
	}
	return null;
}
