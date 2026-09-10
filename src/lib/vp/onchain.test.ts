import { describe, expect, test } from 'bun:test';
import { sentimentTopicPath, vpForMsig, vpForTopic, vpMsigSteps } from './onchain';
import type { VpSummary } from './types';

const base: VpSummary = {
	vp: 'VP-9999',
	title: 'Demo',
	standard: 'VPS-1',
	status: 'Proposed',
	authors: ['Aaron Cox (Greymass)'],
	created: '2026-08-10',
	accounts: [],
	msigs: [
		{ proposer: 'demoaccount1', proposal: 'vpdemo', status: 'active' },
		{ proposer: 'demoaccount1', proposal: 'vpdone', status: 'executed', txid: 'ab'.repeat(32) },
		{ proposer: 'demoaccount1', proposal: 'vpold', status: 'expired' }
	],
	sentiment: [{ contract: 'sentiment.gm', topic: 'vpdemotopic' }],
	requires: [],
	slug: 'vp-9999-demo',
	path: 'proposals/vp-9999-demo/proposal.md',
	updated: null,
	translations: [],
	documents: []
};

describe('vpMsigSteps', () => {
	const steps = (msigs: VpSummary['msigs'], lang?: string) => vpMsigSteps({ ...base, msigs }, lang);

	test('keeps declared order rather than sorting by status', () => {
		const result = steps([
			{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'executed', txid: 'a'.repeat(64) },
			{ proposer: 'test.gm', proposal: 'bbbbbbbbbbbb', status: 'active' }
		]);
		expect(result.map((s) => s.proposal)).toEqual(['aaaaaaaaaaaa', 'bbbbbbbbbbbb']);
		expect(result.map((s) => s.step)).toEqual([1, 2]);
	});

	test('marks only an active step as live', () => {
		const result = steps([
			{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'executed', txid: 'a'.repeat(64) },
			{ proposer: 'test.gm', proposal: 'bbbbbbbbbbbb', status: 'active' },
			{ proposer: 'test.gm', proposal: 'cccccccccccc', status: 'expired' },
			{ proposer: 'test.gm', proposal: 'dddddddddddd', status: 'cancelled' },
			{ status: 'planned', title: 'Create the account' }
		]);
		expect(result.map((s) => s.live)).toEqual([false, true, false, false, false]);
	});

	test('models a planned step with no binding', () => {
		const [only] = steps([{ status: 'planned', title: 'Create the account' }]);
		expect(only.planned).toBe(true);
		expect(only.msigPath).toBe(null);
		expect(only.proposer).toBe(null);
		expect(only.title).toBe('Create the account');
	});

	test('folds a superseded attempt into its successor and does not number it', () => {
		const result = steps([
			{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'expired' },
			{
				proposer: 'test.gm',
				proposal: 'bbbbbbbbbbbb',
				status: 'active',
				supersedes: { proposer: 'test.gm', proposal: 'aaaaaaaaaaaa' }
			}
		]);
		expect(result).toHaveLength(1);
		expect(result[0].proposal).toBe('bbbbbbbbbbbb');
		expect(result[0].step).toBe(1);
		expect(result[0].supersededAttempts).toBe(1);
	});

	test('counts a chain of retries', () => {
		const result = steps([
			{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'expired' },
			{
				proposer: 'test.gm',
				proposal: 'bbbbbbbbbbbb',
				status: 'cancelled',
				supersedes: { proposer: 'test.gm', proposal: 'aaaaaaaaaaaa' }
			},
			{
				proposer: 'test.gm',
				proposal: 'cccccccccccc',
				status: 'active',
				supersedes: { proposer: 'test.gm', proposal: 'bbbbbbbbbbbb' }
			}
		]);
		expect(result).toHaveLength(1);
		expect(result[0].supersededAttempts).toBe(2);
	});

	test('builds a transaction path only for an executed step', () => {
		const [executed] = steps([
			{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'executed', txid: 'f'.repeat(64) }
		]);
		expect(executed.txPath).toBe(`/transaction/${'f'.repeat(64)}`);
		const [active] = steps([{ proposer: 'test.gm', proposal: 'bbbbbbbbbbbb', status: 'active' }]);
		expect(active.txPath).toBe(null);
	});

	test('prefers a translated title for the requested language', () => {
		const summary = {
			...base,
			msigs: [{ status: 'planned', title: 'Create the account' }],
			translations: [
				{
					lang: 'ko',
					path: 'p.ko.md',
					current: true,
					msigs: [{ step: 1, title: '계정 생성' }]
				}
			]
		} as unknown as VpSummary;
		expect(vpMsigSteps(summary, 'ko')[0].title).toBe('계정 생성');
		expect(vpMsigSteps(summary, 'en')[0].title).toBe('Create the account');
	});

	test('falls back to the English title when a translation lacks one', () => {
		const summary = {
			...base,
			msigs: [{ status: 'planned', title: 'Create the account' }],
			translations: [{ lang: 'ko', path: 'p.ko.md', current: true, msigs: [] }]
		} as unknown as VpSummary;
		expect(vpMsigSteps(summary, 'ko')[0].title).toBe('Create the account');
	});

	test('returns a null title when none is authored', () => {
		expect(
			steps([{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'active' }])[0].title
		).toBe(null);
	});
});

describe('vpForMsig', () => {
	const index = {
		generated: '2026-08-13T00:00:00Z',
		proposals: [{ ...base, vp: 'VP-0001', slug: 'vp-0001-first', msigs: [] }, base],
		skipped: 0
	};

	test('finds the proposal whose msigs contain the pair', () => {
		const found = vpForMsig(index, 'demoaccount1', 'vpdemo');
		expect(found?.vp).toBe('VP-9999');
	});

	test('returns null when no proposal claims the msig', () => {
		expect(vpForMsig(index, 'demoaccount1', 'nosuchmsig')).toBeNull();
	});

	test('returns null when the proposer does not match', () => {
		expect(vpForMsig(index, 'otheraccount', 'vpdemo')).toBeNull();
	});

	test('returns null for an index with no proposals', () => {
		expect(vpForMsig({ generated: '', proposals: [], skipped: 0 }, 'a', 'b')).toBeNull();
	});
});

describe('vpForTopic', () => {
	const index = {
		generated: '2026-08-13T00:00:00Z',
		proposals: [{ ...base, vp: 'VP-0001', slug: 'vp-0001-first', sentiment: [] }, base],
		skipped: 0
	};

	test('finds the proposal that declares the topic', () => {
		const found = vpForTopic(index, 'vpdemotopic');
		expect(found?.vp).toBe('VP-9999');
	});

	test('returns null when no proposal declares the topic', () => {
		expect(vpForTopic(index, 'nosuchtopic')).toBeNull();
	});
});

describe('sentimentTopicPath', () => {
	test('routes to the topic page by topic name', () => {
		expect(sentimentTopicPath({ contract: 'sentiment.gm', topic: 'vpdemotopic' })).toBe(
			'/sentiment/topics/vpdemotopic'
		);
	});
});
