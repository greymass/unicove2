import { prepareVpDocument } from './document';
import { createSlugger } from './slug';
import type { VpDocumentRef } from './types';

const WORDS_PER_MINUTE = 230;
const STATUS_LINE = /^\*\*Status:\s*(.+?)\*\*\s*$/;
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE = /^(```|~~~)/;
const LABEL_BREAK = /\s+[—–]\s+|:\s+/u;
const LABEL_MAX = 32;

export interface VpExhibit {
	heading: string | null;
	statusLine: string | null;
	body: string;
	words: number;
	minutes: number;
}

export interface VpTocEntry {
	depth: 1 | 2 | 3;
	text: string;
	id: string;
}

export function vpDocumentStem(path: string): string {
	const file = path.split('/').pop() ?? path;
	return file.replace(/\.md$/, '');
}

export function findVpDocument(
	documents: VpDocumentRef[],
	stem: string
): VpDocumentRef | undefined {
	return documents.find((doc) => vpDocumentStem(doc.path) === stem);
}

export function vpDocumentHeading(doc: VpDocumentRef): string {
	return doc.heading ?? vpDocumentStem(doc.path);
}

/** A short label for chrome (tabs, breadcrumb, prev/next): the heading up to its first separator. */
export function vpDocumentLabel(doc: VpDocumentRef): string {
	if (!doc.heading) return vpDocumentStem(doc.path);
	const short = doc.heading.split(LABEL_BREAK)[0].trim() || doc.heading.trim();
	return short.length > LABEL_MAX ? `${short.slice(0, LABEL_MAX - 1).trimEnd()}…` : short;
}

export function selectVpDocumentFile(
	doc: VpDocumentRef,
	locale: string
): { path: string; lang: string; stale: boolean } {
	if (locale === 'en') {
		return { path: doc.path, lang: 'en', stale: false };
	}
	const translation = doc.translations.find((t) => t.lang === locale);
	if (!translation) {
		return { path: doc.path, lang: 'en', stale: false };
	}
	return { path: translation.path, lang: translation.lang, stale: !translation.current };
}

export function prepareVpExhibit(raw: string): VpExhibit {
	const { title, body } = prepareVpDocument(raw);
	let statusLine: string | null = null;
	const lines = body.split('\n');
	for (let i = 0; i < Math.min(lines.length, 8); i++) {
		const match = STATUS_LINE.exec(lines[i].trim());
		if (match) {
			statusLine = match[1];
			break;
		}
	}
	// Count only word-like tokens so table pipes and rule lines do not inflate the estimate.
	const words = body.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
	return {
		heading: title,
		statusLine,
		body,
		words,
		minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE))
	};
}

/** Table of contents from a body's h1-h3 lines, slugged in step with rehypeVpHeadingIds. */
export function buildVpToc(body: string): VpTocEntry[] {
	const slug = createSlugger();
	const toc: VpTocEntry[] = [];
	let fenced = false;
	for (const line of body.split('\n')) {
		if (FENCE.test(line.trim())) {
			fenced = !fenced;
			continue;
		}
		if (fenced) continue;
		const match = HEADING.exec(line);
		if (!match) continue;
		const depth = match[1].length;
		const text = match[2].replace(/[*_`]/g, '');
		const id = slug(text);
		if (depth <= 3) toc.push({ depth: depth as 1 | 2 | 3, text, id });
	}
	return toc;
}
