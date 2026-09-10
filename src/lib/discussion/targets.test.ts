import { describe, expect, test } from 'bun:test';
import {
	defaultPostTarget,
	descriptorFromParam,
	msigDescriptor,
	proposalDescriptors,
	topicDescriptor
} from './targets';
import type { VpSummary } from '$lib/vp/types';

function summary(overrides: Partial<VpSummary> = {}): VpSummary {
	return {
		vp: 'VP-0042',
		title: 'Test',
		standard: 'VPS-1',
		status: 'Proposed',
		authors: [],
		created: '2026-01-01',
		accounts: [],
		requires: [],
		slug: 'vp-0042-test',
		path: 'vp-0042-test',
		updated: null,
		translations: [],
		msigs: [],
		sentiment: [],
		...overrides
	} as VpSummary;
}

describe('descriptors', () => {
	test('msig descriptor is postable only while proposed', () => {
		const d = msigDescriptor('greymass', 'vp42', 'proposed');
		expect(d).toMatchObject({
			key: 'msig:greymass:vp42',
			tuple: ['msig', 'greymass', 'vp42'],
			postable: true
		});
		expect(msigDescriptor('greymass', 'vp42', 'executed').postable).toBe(false);
	});
	test('topic descriptor', () => {
		expect(topicDescriptor('sentiment.gm', 'vp42')).toMatchObject({
			key: 'topic:sentiment.gm:vp42',
			postable: true
		});
	});
	test('proposal descriptors list the topic first then steps with bound msigs', () => {
		const list = proposalDescriptors(
			summary({
				sentiment: [{ contract: 'sentiment.gm', topic: 'vp42' }],
				msigs: [
					{ proposer: 'greymass', proposal: 'vp42a', status: 'executed' },
					{ proposer: 'greymass', proposal: 'vp42b', status: 'active' },
					{ status: 'planned' }
				]
			})
		);
		expect(list.map((d) => d.key)).toEqual([
			'topic:sentiment.gm:vp42',
			'msig:greymass:vp42a',
			'msig:greymass:vp42b'
		]);
		expect(list.map((d) => d.postable)).toEqual([true, false, true]);
		expect(list[1].label).toMatch(/^Step 1/);
	});
	test('descriptorFromParam resolves a key and rejects unknown', () => {
		const list = proposalDescriptors(
			summary({ sentiment: [{ contract: 'sentiment.gm', topic: 'vp42' }] })
		);
		expect(descriptorFromParam(list, 'topic:sentiment.gm:vp42')?.key).toBe(
			'topic:sentiment.gm:vp42'
		);
		expect(descriptorFromParam(list, 'msig:x:y')).toBeNull();
		expect(descriptorFromParam(list, null)).toBeNull();
	});
	test('defaultPostTarget prefers the active chip, then the topic, then the live step', () => {
		const list = proposalDescriptors(
			summary({
				sentiment: [{ contract: 'sentiment.gm', topic: 'vp42' }],
				msigs: [{ proposer: 'greymass', proposal: 'vp42b', status: 'active' }]
			})
		);
		expect(defaultPostTarget(list, list[1])?.key).toBe('msig:greymass:vp42b');
		expect(defaultPostTarget(list, null)?.key).toBe('topic:sentiment.gm:vp42');
		const steps = proposalDescriptors(
			summary({ msigs: [{ proposer: 'greymass', proposal: 'vp42b', status: 'active' }] })
		);
		expect(defaultPostTarget(steps, null)?.key).toBe('msig:greymass:vp42b');
		expect(defaultPostTarget([], null)).toBeNull();
	});
});
