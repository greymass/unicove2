import { describe, expect, test } from 'bun:test';
import { isIndexableExplorerRoute } from './robots';

const base = '/[[locale]]/[network]/(explorer)';

describe('isIndexableExplorerRoute', () => {
	test('hub pages are indexable', () => {
		for (const r of ['producers', 'network', 'governance', 'sentiment', 'topics', 'proposals']) {
			expect(isIndexableExplorerRoute(`${base}/${r}`)).toBe(true);
		}
	});

	test('entity overview pages are indexable', () => {
		expect(isIndexableExplorerRoute(`${base}/account/[name]`)).toBe(true);
		expect(isIndexableExplorerRoute(`${base}/token/[contract]/[symbol]`)).toBe(true);
		expect(isIndexableExplorerRoute(`${base}/contract/[contract]`)).toBe(true);
	});

	test('entity sub-tabs are not indexable', () => {
		expect(isIndexableExplorerRoute(`${base}/account/[name]/activity`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/account/[name]/balances`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/contract/[contract]/tables/[table]/[[scope]]`)).toBe(
			false
		);
		expect(isIndexableExplorerRoute(`${base}/contract/[contract]/abi`)).toBe(false);
	});

	test('hash-named families are not indexable', () => {
		expect(isIndexableExplorerRoute(`${base}/transaction/[id]/[[seq]]`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/transaction/[id]/[[seq]]/actions`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/block/[number]`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/block/[number]/data`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/key/[publicKey]`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/msig/[proposer]/[proposal]`)).toBe(false);
		expect(isIndexableExplorerRoute(`${base}/prompt/[payload]`)).toBe(false);
	});

	test('unknown or missing route ids default to indexable', () => {
		expect(isIndexableExplorerRoute(null)).toBe(true);
		expect(isIndexableExplorerRoute(`${base}/future`)).toBe(true);
	});
});
