import { describe, expect, test } from 'bun:test';
import {
	RAW_BASE,
	VP_BRANCH,
	VP_DEMO_BRANCH,
	vpBranchForRef,
	vpRawBase,
	vpSourceUrl,
	vpStandardUrl,
	vpHistoryUrl,
	rewriteVpHref,
	resolveVpImageSrc
} from './links';
import { slugify } from './slug';

const ctx = { slug: 'vp-0001-ram-gifting', basePath: '/en/vaulta/proposals' };

test('RAW_BASE points at the vaulta-proposals repo on a single branch segment', () => {
	expect(RAW_BASE).toMatch(
		/^https:\/\/raw\.githubusercontent\.com\/greymass\/vaulta-proposals\/[A-Za-z0-9._-]+\/$/
	);
});

describe('vpBranchForRef', () => {
	test('routes the demo ref number form to the demo branch', () => {
		expect(vpBranchForRef('vp-9999')).toBe(VP_DEMO_BRANCH);
	});

	test('routes the demo ref full-slug form to the demo branch', () => {
		expect(vpBranchForRef('vp-9999-demo')).toBe(VP_DEMO_BRANCH);
	});

	test('is case insensitive on the demo ref', () => {
		expect(vpBranchForRef('VP-9999')).toBe(VP_DEMO_BRANCH);
	});

	test('routes an ordinary proposal to the configured branch', () => {
		expect(vpBranchForRef('vp-0001')).toBe(VP_BRANCH);
		expect(vpBranchForRef('vp-0001-ram-gifting')).toBe(VP_BRANCH);
	});

	test('routes a malformed ref to the configured branch', () => {
		expect(vpBranchForRef('not-a-ref')).toBe(VP_BRANCH);
		expect(vpBranchForRef('vp-1')).toBe(VP_BRANCH);
	});
});

describe('vpRawBase', () => {
	test('defaults to VP_BRANCH', () => {
		expect(vpRawBase()).toBe(RAW_BASE);
	});

	test('builds a raw base for an explicit branch', () => {
		expect(vpRawBase('demo')).toBe(
			'https://raw.githubusercontent.com/greymass/vaulta-proposals/demo/'
		);
	});
});

describe('rewriteVpHref', () => {
	test('rewrites a cross-VP link to the internal route', () => {
		const out = rewriteVpHref('../vp-0002-account-creation/proposal.md', ctx);
		expect(out).toEqual({ kind: 'internal', href: '/en/vaulta/proposals/vp-0002' });
	});

	test('preserves an anchor on a cross-VP link', () => {
		const out = rewriteVpHref('../vp-0002-account-creation/proposal.md#bounds', ctx);
		expect(out.href).toBe('/en/vaulta/proposals/vp-0002#bounds');
	});

	test('rejects a hostile anchor with injection characters', () => {
		const out = rewriteVpHref(
			'../vp-0002-account-creation/proposal.md#"><script>alert(1)</script>',
			ctx
		);
		expect(out.kind).toBe('internal');
		expect(out.href).toBe('/en/vaulta/proposals/vp-0002');
		expect(out.href).not.toContain('"');
		expect(out.href).not.toContain('<');
		expect(out.href).not.toContain('>');
	});

	test('preserves a GFM slug anchor', () => {
		const out = rewriteVpHref(
			'../vp-0002-account-creation/proposal.md#bounds-on-the-endowment',
			ctx
		);
		expect(out.href).toBe('/en/vaulta/proposals/vp-0002#bounds-on-the-endowment');
	});

	test('drops the language tag, since locale drives language', () => {
		const out = rewriteVpHref('../vp-0002-account-creation/proposal.ko.md', ctx);
		expect(out.href).toBe('/en/vaulta/proposals/vp-0002');
	});

	test('rewrites an asset link to a raw fetch in its own directory', () => {
		const out = rewriteVpHref('assets/diagram.svg', ctx);
		expect(out.kind).toBe('external');
		expect(out.href).toBe(`${RAW_BASE}proposals/vp-0001-ram-gifting/assets/diagram.svg`);
	});

	test('rewrites an asset link against an explicit branch in ctx', () => {
		const out = rewriteVpHref('assets/diagram.svg', { ...ctx, branch: 'demo' });
		expect(out).toEqual({
			kind: 'external',
			href: 'https://raw.githubusercontent.com/greymass/vaulta-proposals/demo/proposals/vp-0001-ram-gifting/assets/diagram.svg'
		});
	});

	test('keeps a commit-pinned github link external', () => {
		const url =
			'https://github.com/VaultaFoundation/system-contracts/blob/9edc8bcfd128f382ae11b88655d958d07f5230d2/contracts/eosio.system/src/delegate_bandwidth.cpp#L164';
		expect(rewriteVpHref(url, ctx)).toEqual({ kind: 'external', href: url });
	});

	test('refuses a github link with a quote in the path', () => {
		const url =
			'https://github.com/VaultaFoundation/system-contracts/blob/9edc8bcfd128f382ae11b88655d958d07f5230d2/file"malicious';
		expect(rewriteVpHref(url, ctx).kind).toBe('plain');
	});

	test('refuses a github link with angle bracket in the path', () => {
		const url =
			'https://github.com/VaultaFoundation/system-contracts/blob/9edc8bcfd128f382ae11b88655d958d07f5230d2/file<script>';
		expect(rewriteVpHref(url, ctx).kind).toBe('plain');
	});

	test('accepts a github link with percent-encoded path segment', () => {
		const url =
			'https://github.com/VaultaFoundation/system-contracts/blob/9edc8bcfd128f382ae11b88655d958d07f5230d2/contracts/My%20File.cpp';
		expect(rewriteVpHref(url, ctx)).toEqual({ kind: 'external', href: url });
	});

	test('refuses a branch-pinned github link', () => {
		const url = 'https://github.com/greymass/vaulta-proposals/blob/master/README.md';
		expect(rewriteVpHref(url, ctx).kind).toBe('plain');
	});

	test('refuses an arbitrary external link', () => {
		expect(rewriteVpHref('https://example.com/thing', ctx).kind).toBe('plain');
	});

	test('refuses a javascript url', () => {
		expect(rewriteVpHref('javascript:alert(1)', ctx).kind).toBe('plain');
	});

	test('keeps a same-document anchor', () => {
		expect(rewriteVpHref('#summary', ctx)).toEqual({ kind: 'internal', href: '#summary' });
	});

	test('refuses a hostile same-document anchor with injection characters', () => {
		const out = rewriteVpHref('#"><script>alert(1)</script>', ctx);
		expect(out.kind).toBe('plain');
		expect(out.href).not.toContain('"');
		expect(out.href).not.toContain('<');
		expect(out.href).not.toContain('>');
	});

	test('refuses an asset link that escapes its directory', () => {
		expect(rewriteVpHref('assets/../../secrets.txt', ctx).kind).toBe('plain');
	});

	test('keeps a same-document Korean anchor', () => {
		expect(rewriteVpHref('#제안-배경', ctx)).toEqual({ kind: 'internal', href: '#제안-배경' });
	});

	test('keeps a same-document Chinese anchor', () => {
		expect(rewriteVpHref('#提案背景', ctx)).toEqual({ kind: 'internal', href: '#提案背景' });
	});

	test('preserves a Korean anchor on a cross-VP link', () => {
		const out = rewriteVpHref('../vp-0002-account-creation/proposal.md#제안-배경', ctx);
		expect(out).toEqual({ kind: 'internal', href: '/en/vaulta/proposals/vp-0002#제안-배경' });
	});

	test('preserves a Chinese anchor on a cross-VP link', () => {
		const out = rewriteVpHref('../vp-0002-account-creation/proposal.md#提案背景', ctx);
		expect(out).toEqual({ kind: 'internal', href: '/en/vaulta/proposals/vp-0002#提案背景' });
	});

	test('refuses a hostile anchor adjacent to non-Latin text, same-document', () => {
		const out = rewriteVpHref('#제안"><script>', ctx);
		expect(out.kind).toBe('plain');
	});

	test('drops a hostile anchor adjacent to non-Latin text on a cross-VP link', () => {
		const out = rewriteVpHref('../vp-0002-account-creation/proposal.md#제안"><script>', ctx);
		expect(out).toEqual({ kind: 'internal', href: '/en/vaulta/proposals/vp-0002' });
	});

	test('accepts every id slugify can produce, keeping SAFE_ANCHOR aligned with slug.ts', () => {
		const headings = ['제안 배경', '提案背景', 'foo_bar baz', 'Hello, World! (v2)'];
		for (const heading of headings) {
			const id = slugify(heading);
			expect(rewriteVpHref(`#${id}`, ctx)).toEqual({ kind: 'internal', href: `#${id}` });
		}
	});

	describe('document links', () => {
		test('rewrites a document link to the document sub-route', () => {
			expect(rewriteVpHref('documents/rfp-framework.md', ctx)).toEqual({
				kind: 'internal',
				href: '/en/vaulta/proposals/vp-0001/documents/rfp-framework'
			});
		});

		test('carries a safe anchor through', () => {
			expect(rewriteVpHref('documents/msig-5.md#blanks-to-fill', ctx)).toEqual({
				kind: 'internal',
				href: '/en/vaulta/proposals/vp-0001/documents/msig-5#blanks-to-fill'
			});
		});

		test('drops an unsafe anchor', () => {
			expect(rewriteVpHref('documents/msig-5.md#a"b', ctx)).toEqual({
				kind: 'internal',
				href: '/en/vaulta/proposals/vp-0001/documents/msig-5'
			});
		});

		test('leaves a translated document file to the plain fallback', () => {
			expect(rewriteVpHref('documents/rfp-framework.ko.md', ctx).kind).toBe('plain');
		});

		test('leaves a nested path to the plain fallback', () => {
			expect(rewriteVpHref('documents/sub/file.md', ctx).kind).toBe('plain');
		});
	});
});

describe('resolveVpImageSrc', () => {
	test('resolves an own-directory asset image to its raw url', () => {
		expect(resolveVpImageSrc('assets/diagram.png', ctx)).toBe(
			`${RAW_BASE}proposals/vp-0001-ram-gifting/assets/diagram.png`
		);
	});

	test('accepts every image extension VPS-1 allows', () => {
		for (const name of ['a.png', 'b.jpg', 'c.webp', 'd.svg']) {
			expect(resolveVpImageSrc(`assets/${name}`, ctx)).toBe(
				`${RAW_BASE}proposals/vp-0001-ram-gifting/assets/${name}`
			);
		}
	});

	test('refuses a third-party image url', () => {
		expect(resolveVpImageSrc('https://attacker.example/p.png', ctx)).toBeNull();
	});

	test('refuses a pinned github link, which is not an asset', () => {
		const url = `https://github.com/greymass/vaulta-proposals/blob/${'a'.repeat(40)}/README.md`;
		expect(resolveVpImageSrc(url, ctx)).toBeNull();
	});

	test('refuses a data url', () => {
		expect(resolveVpImageSrc('data:image/svg+xml;base64,AAAA', ctx)).toBeNull();
	});

	test('refuses an asset that is not an image', () => {
		expect(resolveVpImageSrc('assets/notes.txt', ctx)).toBeNull();
	});

	test('refuses an asset link that escapes its directory', () => {
		expect(resolveVpImageSrc('assets/../../logo.png', ctx)).toBeNull();
	});

	test('resolves an asset against an explicit demo branch to a demo raw url', () => {
		expect(resolveVpImageSrc('assets/pipeline.svg', { ...ctx, branch: 'demo' })).toBe(
			'https://raw.githubusercontent.com/greymass/vaulta-proposals/demo/proposals/vp-0001-ram-gifting/assets/pipeline.svg'
		);
	});
});

describe('vpSourceUrl', () => {
	test('links to the proposal folder on the configured branch', () => {
		expect(vpSourceUrl('vp-0001-ram-gifting')).toBe(
			`https://github.com/greymass/vaulta-proposals/tree/${VP_BRANCH}/proposals/vp-0001-ram-gifting`
		);
	});

	test('links to the proposal folder on an explicit branch', () => {
		expect(vpSourceUrl('vp-9999-demo', 'demo')).toBe(
			'https://github.com/greymass/vaulta-proposals/tree/demo/proposals/vp-9999-demo'
		);
	});
});

describe('vpStandardUrl', () => {
	test('links to the standard document on the configured branch', () => {
		expect(vpStandardUrl('VPS-1')).toBe(
			`https://github.com/greymass/vaulta-proposals/blob/${VP_BRANCH}/standard/VPS-1.md`
		);
	});

	test('links to the standard document on an explicit branch', () => {
		expect(vpStandardUrl('VPS-1', 'demo')).toBe(
			'https://github.com/greymass/vaulta-proposals/blob/demo/standard/VPS-1.md'
		);
	});
});

describe('vpHistoryUrl', () => {
	test('links to the proposal file commit history on the configured branch', () => {
		expect(vpHistoryUrl('vp-0001-ram-gifting')).toBe(
			`https://github.com/greymass/vaulta-proposals/commits/${VP_BRANCH}/proposals/vp-0001-ram-gifting/proposal.md`
		);
	});

	test('links to the proposal file commit history on an explicit branch', () => {
		expect(vpHistoryUrl('vp-9999-demo', 'demo')).toBe(
			'https://github.com/greymass/vaulta-proposals/commits/demo/proposals/vp-9999-demo/proposal.md'
		);
	});
});
