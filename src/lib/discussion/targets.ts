import { tupleFor, tupleKey, type Target, type Tuple } from '$lib/msg/model';
import { vpMsigSteps } from '$lib/vp/onchain';
import type { VpSummary } from '$lib/vp/types';

export interface TargetDescriptor {
	target: Target;
	key: string;
	tuple: Tuple;
	label: string;
	postable: boolean;
	step?: number;
	title?: string | null;
}

const LIVE = new Set(['proposed', 'active']);

export function msigDescriptor(
	proposer: string,
	proposal: string,
	status: string,
	step?: { number: number; title: string | null }
): TargetDescriptor {
	const target: Target = { kind: 'msig', proposer, proposal };
	const tuple = tupleFor(target);
	const label = step
		? step.title
			? `Step ${step.number}: ${step.title}`
			: `Step ${step.number}`
		: `${proposer}/${proposal}`;
	return {
		target,
		key: tupleKey(tuple),
		tuple,
		label,
		postable: LIVE.has(status),
		step: step?.number,
		title: step?.title
	};
}

export function topicDescriptor(contract: string, topic: string): TargetDescriptor {
	const target: Target = { kind: 'topic', contract, topic };
	const tuple = tupleFor(target);
	return { target, key: tupleKey(tuple), tuple, label: 'Proposal', postable: true };
}

export function proposalDescriptors(summary: VpSummary, locale?: string): TargetDescriptor[] {
	const list: TargetDescriptor[] = summary.sentiment.map((s) =>
		topicDescriptor(s.contract, s.topic)
	);
	for (const step of vpMsigSteps(summary, locale)) {
		if (!step.proposer || !step.proposal) continue;
		list.push(
			msigDescriptor(step.proposer, step.proposal, step.status, {
				number: step.step,
				title: step.title ?? null
			})
		);
	}
	return list;
}

/** Short human label for a target: "Proposal", "Step 3". Never the full step title. */
export function shortLabel(descriptor: TargetDescriptor): string {
	if (descriptor.target.kind === 'topic') return 'Proposal';
	if (descriptor.step) return `Step ${descriptor.step}`;
	return descriptor.label;
}

export function descriptorFromParam(
	descriptors: TargetDescriptor[],
	param: string | null
): TargetDescriptor | null {
	if (!param) return null;
	return descriptors.find((d) => d.key === param) ?? null;
}

export function defaultPostTarget(
	descriptors: TargetDescriptor[],
	active: TargetDescriptor | null
): TargetDescriptor | null {
	if (active) return active;
	const topic = descriptors.find((d) => d.target.kind === 'topic');
	if (topic) return topic;
	return descriptors.find((d) => d.target.kind === 'msig' && d.postable) ?? null;
}
