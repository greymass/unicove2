import { describe, expect, test } from 'bun:test';
import { vpRouteTabs } from './routes';
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
		documents: [],
		...overrides
	} as VpSummary;
}

describe('vpRouteTabs', () => {
	test('a draft with nothing bound offers only the document', () => {
		const tabs = vpRouteTabs('/proposals/vp-9999', summary(), {
			sentimentEnabled: true,
			discussionEnabled: false,
			revisionCount: 0
		});
		expect(tabs.map((t) => t.kind)).toEqual(['proposal']);
		expect(tabs[0].href).toBe('/proposals/vp-9999');
	});

	test('documents appear with their count right after the proposal', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({
				documents: [
					{ path: 'proposals/vp-9999-demo/documents/a.md', translations: [] },
					{ path: 'proposals/vp-9999-demo/documents/b.md', translations: [] }
				]
			}),
			{ sentimentEnabled: true, discussionEnabled: false, revisionCount: 1 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'documents', 'revisions']);
		expect(tabs[1].count).toBe(2);
		expect(tabs[1].href).toBe('/proposals/vp-9999/documents');
	});

	test('revisions appear with their count', () => {
		const tabs = vpRouteTabs('/proposals/vp-9999', summary(), {
			sentimentEnabled: true,
			discussionEnabled: false,
			revisionCount: 3
		});
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'revisions']);
		expect(tabs[1].count).toBe(3);
		expect(tabs[1].href).toBe('/proposals/vp-9999/revisions');
	});

	test('multisigs and sentiment appear when the proposal is bound', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' },
					{ proposer: 'test.gm', proposal: 'hqmz3rvktdxa', status: 'executed' }
				],
				sentiment: [{ contract: 'sentiment.gm', topic: 'sentiment' }]
			}),
			{ sentimentEnabled: true, discussionEnabled: false, revisionCount: 3 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'multisigs', 'sentiment', 'revisions']);
		expect(tabs.map((t) => t.count)).toEqual([undefined, 2, undefined, 3]);
	});

	test('sentiment is absent when the network build has it switched off', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({ sentiment: [{ contract: 'sentiment.gm', topic: 'sentiment' }] }),
			{ sentimentEnabled: false, discussionEnabled: false, revisionCount: 0 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal']);
	});

	test('adds a discussion tab after multisigs when enabled and on-chain objects exist', () => {
		const summaryWithMsig = summary({
			msigs: [{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' }]
		});
		const tabs = vpRouteTabs('/proposals/vp-9999', summaryWithMsig, {
			sentimentEnabled: true,
			discussionEnabled: true,
			revisionCount: 0
		});
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'multisigs', 'discussion']);
		const off = vpRouteTabs('/proposals/vp-9999', summaryWithMsig, {
			sentimentEnabled: true,
			discussionEnabled: false,
			revisionCount: 0
		});
		expect(off.map((t) => t.kind)).not.toContain('discussion');
	});

	test('a summary whose only msig is planned gets multisigs but no discussion tab', () => {
		const summaryWithPlannedOnly = summary({
			msigs: [{ status: 'planned', title: 'Return the account' }]
		});
		const tabs = vpRouteTabs('/proposals/vp-9999', summaryWithPlannedOnly, {
			sentimentEnabled: true,
			discussionEnabled: true,
			revisionCount: 0
		});
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'multisigs']);
		expect(tabs.map((t) => t.kind)).not.toContain('discussion');
	});

	test('steps without a sentiment topic offer no sentiment tab', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({ msigs: [{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' }] }),
			{ sentimentEnabled: true, discussionEnabled: false, revisionCount: 0 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'multisigs']);
	});

	test('a sentiment topic offers the sentiment tab', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({ sentiment: [{ contract: 'sentiment.gm', topic: 'sentiment' }] }),
			{ sentimentEnabled: true, discussionEnabled: false, revisionCount: 0 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'sentiment']);
	});
});

describe('vpRouteTabs multisig count', () => {
	test('counts steps rather than raw entries, so a superseded attempt does not inflate it', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'expired' },
					{
						proposer: 'test.gm',
						proposal: 'bbbbbbbbbbbb',
						status: 'executed',
						txid: 'a'.repeat(64),
						supersedes: { proposer: 'test.gm', proposal: 'aaaaaaaaaaaa' }
					},
					{ status: 'planned', title: 'Return the account' }
				]
			}),
			{ sentimentEnabled: true, discussionEnabled: false, revisionCount: 0 }
		);
		const multisigs = tabs.find((t) => t.kind === 'multisigs');
		expect(multisigs?.count).toBe(2);
	});
});
