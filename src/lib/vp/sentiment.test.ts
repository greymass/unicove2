import { describe, expect, test } from 'bun:test';
import { vpMsigSteps } from './onchain';
import { vpProposalTopicRows, vpStepHasPoll } from './sentiment';
import type { VpSummary } from './types';

function summary(overrides: Partial<VpSummary> = {}): VpSummary {
	return {
		vp: 'VP-9999',
		title: 'Demonstration',
		standard: 'VPS-1',
		status: 'Proposed',
		authors: ['Aaron Cox'],
		created: '2026-08-10',
		accounts: [],
		msigs: [],
		sentiment: [],
		requires: [],
		slug: 'vp-9999-demo',
		path: 'proposals/vp-9999-demo/proposal.md',
		updated: null,
		translations: [],
		...overrides
	} as VpSummary;
}

describe('vpProposalTopicRows', () => {
	test('one row per declared topic, all votable', () => {
		const rows = vpProposalTopicRows(
			summary({ sentiment: [{ contract: 'sentiment.gm', topic: 'sentiment' }] })
		);
		expect(rows).toEqual([
			{
				kind: 'proposal',
				contract: 'sentiment.gm',
				topic: 'sentiment',
				topicPath: '/sentiment/topics/sentiment',
				votable: true
			}
		]);
		expect(rows[0].topic).toBe('sentiment');
	});

	test('no topics gives no rows', () => {
		expect(vpProposalTopicRows(summary())).toEqual([]);
	});
});

describe('vpStepHasPoll', () => {
	test('a planned step has no poll, because there is no multisig to poll on', () => {
		const steps = vpMsigSteps(
			summary({ msigs: [{ status: 'planned', title: 'Create the account' }] })
		);
		expect(steps.map(vpStepHasPoll)).toEqual([false]);
	});

	test('a step proposed on-chain has a poll whatever its status', () => {
		const steps = vpMsigSteps(
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'hqmz3rvktdxa', status: 'executed' },
					{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' },
					{ proposer: 'test.gm', proposal: 'pfy4wnsbcjrt', status: 'expired' }
				]
			})
		);
		expect(steps.map(vpStepHasPoll)).toEqual([true, true, true]);
	});

	test('a planned step among proposed ones is the only one without a poll', () => {
		const steps = vpMsigSteps(
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'active' },
					{ status: 'planned', title: 'Hand over the keys' }
				]
			})
		);
		expect(steps.map(vpStepHasPoll)).toEqual([true, false]);
	});
});
