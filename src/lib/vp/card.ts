import type { VpSummary } from './types';

export interface VpCardText {
	title: string;
	excerpt?: string;
}

export function vpCardText(summary: VpSummary, locale: string): VpCardText {
	const translation = summary.translations.find((t) => t.lang === locale);
	return {
		title: translation?.title ?? summary.title,
		excerpt: translation?.excerpt ?? summary.excerpt
	};
}
