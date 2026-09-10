import * as publicEnv from '$env/static/public';
import { normalizeVpRef } from './resolve';

const optionalEnv = publicEnv as Partial<Record<string, string>>;
const requested = optionalEnv.PUBLIC_VP_BRANCH ?? 'master';
export const VP_BRANCH = /^[A-Za-z0-9._-]+$/.test(requested) ? requested : 'master';

// VP-9999 always renders from the demo branch; it stays unlisted because the index route never fetches it.
export const VP_DEMO_BRANCH = 'demo';
export const VP_DEMO_REF = 'vp-9999';

/** The branch to fetch a proposal's content from: the demo branch for VP-9999, VP_BRANCH otherwise. */
export function vpBranchForRef(ref: string): string {
	return normalizeVpRef(ref) === VP_DEMO_REF ? VP_DEMO_BRANCH : VP_BRANCH;
}

export function vpRawBase(branch: string = VP_BRANCH): string {
	return `https://raw.githubusercontent.com/greymass/vaulta-proposals/${branch}/`;
}
export const RAW_BASE = vpRawBase();

const REPO_BASE = 'https://github.com/greymass/vaulta-proposals';

export function vpSourceUrl(slug: string, branch: string = VP_BRANCH): string {
	return `${REPO_BASE}/tree/${branch}/proposals/${slug}`;
}

export function vpStandardUrl(standard: string, branch: string = VP_BRANCH): string {
	return `${REPO_BASE}/blob/${branch}/standard/${standard}.md`;
}

export function vpHistoryUrl(slug: string, branch: string = VP_BRANCH): string {
	return `${REPO_BASE}/commits/${branch}/proposals/${slug}/proposal.md`;
}

export type VpHref = { kind: 'internal' | 'external' | 'plain'; href: string };

const CROSS_VP = /^\.\.\/vp-(\d{4})(?:-[a-z0-9-]+)?\/proposal(?:\.[a-z-]+)?\.md(#[^\s]*)?$/;
const SAFE_ANCHOR = /^#[\p{L}\p{N}_-]+$/u;
const DOCUMENT = /^documents\/([A-Za-z0-9_-]+)\.md(#[^\s]*)?$/;
const ASSET = /^assets\/([A-Za-z0-9._-]+)$/;
const PINNED_GITHUB =
	/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:blob|tree)\/[0-9a-f]{40}\/[a-zA-Z0-9._/#%-]+$/;

const IMAGE_EXTENSION = /\.(?:png|jpg|webp|svg)$/i;

export function rewriteVpHref(
	href: string,
	ctx: { slug: string; basePath: string; branch?: string }
): VpHref {
	const target = href.trim();
	const rawBase = vpRawBase(ctx.branch ?? VP_BRANCH);

	if (target.startsWith('#')) {
		return SAFE_ANCHOR.test(target)
			? { kind: 'internal', href: target }
			: { kind: 'plain', href: '' };
	}

	const cross = CROSS_VP.exec(target);
	if (cross) {
		const rawAnchor = cross[2] ?? '';
		const anchor = rawAnchor && SAFE_ANCHOR.test(rawAnchor) ? rawAnchor : '';
		return { kind: 'internal', href: `${ctx.basePath}/vp-${cross[1]}${anchor}` };
	}

	const doc = DOCUMENT.exec(target);
	if (doc) {
		const ref = normalizeVpRef(ctx.slug) ?? ctx.slug;
		const rawAnchor = doc[2] ?? '';
		const anchor = rawAnchor && SAFE_ANCHOR.test(rawAnchor) ? rawAnchor : '';
		return { kind: 'internal', href: `${ctx.basePath}/${ref}/documents/${doc[1]}${anchor}` };
	}

	const asset = ASSET.exec(target);
	if (asset) {
		return { kind: 'external', href: `${rawBase}proposals/${ctx.slug}/assets/${asset[1]}` };
	}

	if (PINNED_GITHUB.test(target)) {
		return { kind: 'external', href: target };
	}

	return { kind: 'plain', href: target };
}

/** Resolves an image source to a proposal asset URL, or null when the source is anything else. */
export function resolveVpImageSrc(
	src: string,
	ctx: { slug: string; basePath: string; branch?: string }
): string | null {
	const rawBase = vpRawBase(ctx.branch ?? VP_BRANCH);
	const assetPrefix = `${rawBase}proposals/${ctx.slug}/assets/`;
	const resolved = rewriteVpHref(src, ctx);
	if (resolved.kind !== 'external' || !resolved.href.startsWith(assetPrefix)) {
		return null;
	}
	return IMAGE_EXTENSION.test(resolved.href) ? resolved.href : null;
}
