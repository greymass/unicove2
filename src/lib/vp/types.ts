import * as v from 'valibot';

export const VP_STATUSES = [
	'Draft',
	'Review',
	'Proposed',
	'Executed',
	'Rejected',
	'Withdrawn',
	'Superseded'
] as const;
export type VpStatus = (typeof VP_STATUSES)[number];

export const VP_MSIG_STATUSES = ['planned', 'active', 'expired', 'executed', 'cancelled'] as const;
export type VpMsigStatus = (typeof VP_MSIG_STATUSES)[number];

const msigSupersedesSchema = v.object({
	proposer: v.string(),
	proposal: v.string()
});

const msigRefSchema = v.object({
	proposer: v.optional(v.string()),
	proposal: v.optional(v.string()),
	status: v.picklist(VP_MSIG_STATUSES),
	txid: v.optional(v.string()),
	title: v.optional(v.string()),
	supersedes: v.optional(msigSupersedesSchema)
});

const sentimentRefSchema = v.object({
	contract: v.string(),
	topic: v.string()
});

const msigTitleSchema = v.object({
	step: v.number(),
	title: v.string()
});

const translationSchema = v.object({
	lang: v.string(),
	path: v.string(),
	current: v.boolean(),
	title: v.optional(v.string()),
	excerpt: v.optional(v.string()),
	msigs: v.optional(v.array(msigTitleSchema), [])
});

const documentTranslationSchema = v.object({
	lang: v.string(),
	path: v.string(),
	current: v.boolean(),
	heading: v.optional(v.string())
});

const documentSchema = v.object({
	path: v.string(),
	heading: v.optional(v.string()),
	translations: v.optional(v.array(documentTranslationSchema), [])
});

const summarySchema = v.object({
	vp: v.pipe(v.string(), v.regex(/^VP-\d{4}$/)),
	title: v.string(),
	standard: v.string(),
	status: v.picklist(VP_STATUSES),
	authors: v.array(v.string()),
	created: v.string(),
	accounts: v.array(v.string()),
	msigs: v.array(msigRefSchema),
	sentiment: v.array(sentimentRefSchema),
	requires: v.array(v.string()),
	replaces: v.optional(v.array(v.string())),
	'superseded-by': v.optional(v.array(v.string())),
	resolution: v.optional(v.string()),
	slug: v.string(),
	path: v.string(),
	excerpt: v.optional(v.string()),
	updated: v.nullable(v.string()),
	translations: v.array(translationSchema),
	documents: v.optional(v.array(documentSchema), [])
});

const envelopeSchema = v.object({
	generated: v.string(),
	proposals: v.array(v.unknown())
});

export type VpSummary = v.InferOutput<typeof summarySchema>;
export type VpDocumentRef = v.InferOutput<typeof documentSchema>;

export interface VpIndex {
	generated: string;
	proposals: VpSummary[];
	skipped: number;
}

export function parseVpIndex(raw: unknown): VpIndex {
	const envelope = v.parse(envelopeSchema, raw);
	const proposals: VpSummary[] = [];
	let skipped = 0;
	for (const entry of envelope.proposals) {
		const result = v.safeParse(summarySchema, entry);
		if (result.success) {
			proposals.push(result.output);
		} else {
			skipped++;
		}
	}
	return { generated: envelope.generated, proposals, skipped };
}
