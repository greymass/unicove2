import { describe, expect, test } from 'bun:test';
import { fetchVpFile, fetchVpIndex, VpFetchError } from './fetch';
import fixture from './fixtures/index.json';

function respondWith(body: unknown, status = 200): typeof fetch {
	return (async () =>
		new Response(typeof body === 'string' ? body : JSON.stringify(body), {
			status
		})) as unknown as typeof fetch;
}

function capturingUrl(body: unknown): { fetcher: typeof fetch; urls: string[] } {
	const urls: string[] = [];
	const fetcher = (async (input: RequestInfo | URL) => {
		urls.push(String(input));
		return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status: 200 });
	}) as unknown as typeof fetch;
	return { fetcher, urls };
}

function refuse(): typeof fetch {
	return (async () => {
		throw new Error('network down');
	}) as unknown as typeof fetch;
}

async function codeOf(run: () => Promise<unknown>): Promise<string> {
	try {
		await run();
	} catch (e) {
		if (e instanceof VpFetchError) return e.code;
		throw e;
	}
	throw new Error('expected a VpFetchError');
}

describe('fetchVpIndex', () => {
	test('parses a valid index', async () => {
		const index = await fetchVpIndex(respondWith(fixture));
		expect(index.proposals.length).toBe(fixture.proposals.length);
	});

	test('reports an unreachable repository', async () => {
		expect(await codeOf(() => fetchVpIndex(refuse()))).toBe('unreachable');
	});

	test('reports an upstream failure', async () => {
		expect(await codeOf(() => fetchVpIndex(respondWith(fixture, 500)))).toBe('index-unavailable');
	});

	test('reports an unreadable index', async () => {
		expect(await codeOf(() => fetchVpIndex(respondWith({ nope: true })))).toBe('index-invalid');
	});

	test('carries no user-facing message', async () => {
		try {
			await fetchVpIndex(refuse());
		} catch (e) {
			expect((e as VpFetchError).message).toBe('unreachable');
		}
	});

	test('fetches from an explicit branch', async () => {
		const { fetcher, urls } = capturingUrl(fixture);
		await fetchVpIndex(fetcher, 'demo');
		expect(urls[0]).toBe(
			'https://raw.githubusercontent.com/greymass/vaulta-proposals/demo/index.json'
		);
	});
});

describe('fetchVpFile', () => {
	test('returns the document text', async () => {
		expect(await fetchVpFile(respondWith('# Proposal'), 'proposals/x/proposal.md')).toBe(
			'# Proposal'
		);
	});

	test('reports an unreachable repository', async () => {
		expect(await codeOf(() => fetchVpFile(refuse(), 'proposals/x/proposal.md'))).toBe(
			'unreachable'
		);
	});

	test('reports a missing document as 404', async () => {
		try {
			await fetchVpFile(respondWith('', 404), 'proposals/x/proposal.md');
			throw new Error('expected a VpFetchError');
		} catch (e) {
			expect(e).toBeInstanceOf(VpFetchError);
			expect((e as VpFetchError).code).toBe('document-missing');
			expect((e as VpFetchError).status).toBe(404);
		}
	});

	test('reports an upstream failure', async () => {
		expect(await codeOf(() => fetchVpFile(respondWith('', 500), 'proposals/x/proposal.md'))).toBe(
			'document-unavailable'
		);
	});

	test('fetches from an explicit branch', async () => {
		const { fetcher, urls } = capturingUrl('# Proposal');
		await fetchVpFile(fetcher, 'proposals/vp-9999-demo/proposal.md', 'demo');
		expect(urls[0]).toBe(
			'https://raw.githubusercontent.com/greymass/vaulta-proposals/demo/proposals/vp-9999-demo/proposal.md'
		);
	});
});
