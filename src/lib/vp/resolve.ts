import type { VpIndex, VpSummary } from './types';

const VP_REF = /^vp-(\d{4})(?:-[a-z0-9-]+)?$/;

export function normalizeVpRef(ref: string): string | null {
	const match = VP_REF.exec(ref.trim().toLowerCase());
	return match ? `vp-${match[1]}` : null;
}

export function findVpSummary(index: VpIndex, ref: string): VpSummary | undefined {
	const requested = ref.trim().toLowerCase();
	const normalized = normalizeVpRef(requested);
	if (!normalized) return undefined;
	const summary = index.proposals.find((p) => p.vp.toLowerCase() === normalized);
	if (!summary) return undefined;
	if (requested === normalized) return summary;
	return requested === summary.slug.toLowerCase() ? summary : undefined;
}

export function selectVpFile(
	summary: VpSummary,
	locale: string
): { path: string; lang: string; stale: boolean } {
	if (locale === 'en') {
		return { path: summary.path, lang: 'en', stale: false };
	}
	const translation = summary.translations.find((t) => t.lang === locale);
	if (!translation) {
		return { path: summary.path, lang: 'en', stale: false };
	}
	return { path: translation.path, lang: translation.lang, stale: !translation.current };
}
