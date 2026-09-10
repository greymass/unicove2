import type { VpMsigStep } from './onchain';
import type { VpSummary } from './types';

export interface VpProposalTopicRow {
	kind: 'proposal';
	contract: string;
	topic: string;
	topicPath: string;
	votable: true;
}

export function vpProposalTopicRows(summary: VpSummary): VpProposalTopicRow[] {
	return summary.sentiment.map((ref) => ({
		kind: 'proposal',
		contract: ref.contract,
		topic: ref.topic,
		topicPath: `/sentiment/topics/${ref.topic}`,
		votable: true
	}));
}

export function vpStepHasPoll(step: VpMsigStep): boolean {
	return !step.planned && Boolean(step.proposer && step.proposal && step.msigPath);
}

export type VpLens = 'system' | 'ram' | 'vote' | 'accounts';
