import { parse as parseYaml } from 'yaml';
import * as v from 'valibot';

export interface VpRevision {
	version: number;
	date: string;
	summary: string;
}

const revisionSchema = v.object({
	version: v.pipe(v.number(), v.integer(), v.minValue(1)),
	date: v.pipe(v.string(), v.isoDate()),
	summary: v.pipe(v.string(), v.minLength(1), v.maxLength(140))
});

const revisionsSchema = v.array(revisionSchema);

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Parses a raw proposal document's frontmatter `revisions` list, defensively: any malformed shape yields no revisions. */
export function parseVpRevisions(raw: string): VpRevision[] {
	const match = FRONTMATTER.exec(raw);
	if (!match) return [];

	let frontmatter: unknown;
	try {
		frontmatter = parseYaml(match[1]);
	} catch {
		return [];
	}

	if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) return [];
	const revisions = (frontmatter as Record<string, unknown>).revisions;
	if (revisions === undefined) return [];

	const result = v.safeParse(revisionsSchema, revisions);
	if (!result.success) return [];

	const seen = new Set<number>();
	for (const entry of result.output) {
		if (seen.has(entry.version)) return [];
		seen.add(entry.version);
	}
	return result.output;
}

// English is the spine (versions, dates); localized summaries overlay it by version, matched by version so a stale, reordered, or incomplete translation still pairs correctly.
export function mergeVpRevisions(english: VpRevision[], localized: VpRevision[]): VpRevision[] {
	const byVersion = new Map(localized.map((entry) => [entry.version, entry]));
	return english.map((entry) => {
		const local = byVersion.get(entry.version);
		const summary = local && local.summary.trim() ? local.summary : entry.summary;
		return { version: entry.version, date: entry.date, summary };
	});
}

export function sortVpRevisionsNewestFirst(revisions: VpRevision[]): VpRevision[] {
	return [...revisions].sort((a, b) => b.version - a.version);
}
