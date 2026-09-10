export const GOVERNANCE_CHANNEL = 'governance';
export const MAX_BODY_BYTES = 65536;
export const MAX_TITLE_BYTES = 256;

export type Tuple = readonly [kind: 'msig' | 'topic', a: string, b: string];

export interface MsigTarget {
	kind: 'msig';
	proposer: string;
	proposal: string;
}
export interface TopicTarget {
	kind: 'topic';
	contract: string;
	topic: string;
}
export type Target = MsigTarget | TopicTarget;

export function tupleFor(target: Target): Tuple {
	return target.kind === 'msig'
		? ['msig', target.proposer, target.proposal]
		: ['topic', target.contract, target.topic];
}

export function targetFromTags(tags: readonly string[] | undefined): Target | null {
	if (!tags || tags.length < 3) return null;
	const [kind, a, b] = tags;
	if (kind === 'msig') return { kind, proposer: a, proposal: b };
	if (kind === 'topic') return { kind, contract: a, topic: b };
	return null;
}

export function tupleKey(tuple: readonly string[]): string {
	return tuple.slice(0, 3).join(':');
}

export function tupleEquals(a: readonly string[], b: readonly string[]): boolean {
	if (a.length < 3 || b.length < 3) return false;
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function titleFor(target: Target): string {
	return target.kind === 'msig'
		? `msig ${target.proposer}/${target.proposal}`
		: `topic ${target.contract}/${target.topic}`;
}

function suffixOf(msgAccount: string): string {
	const dot = msgAccount.lastIndexOf('.');
	return dot === -1 ? msgAccount : msgAccount.slice(dot + 1);
}

export function forumAccountFor(msgAccount: string): string {
	return `forum.${suffixOf(msgAccount)}`;
}

export function hookAccountFor(hook: 'tokenreq' | 'block', msgAccount: string): string {
	return `${hook}.${suffixOf(msgAccount)}`;
}

const encoder = new TextEncoder();

export function byteLength(text: string): number {
	return encoder.encode(text).length;
}

export function normalizeBody(body: string): string {
	return body
		.replace(/\r\n?/g, '\n')
		.replace(/[\u2028\u2029]/g, '\n')
		.replace(/\t/g, '    ');
}

// U+202A..U+202E and U+2066..U+2069 are rejected by the on-chain validator
const BIDI = /[‪-‮⁦-⁩]/;

export type BodyCheck =
	| { ok: true; bytes: number }
	| { ok: false; reason: 'empty' | 'too_long' | 'bidi'; bytes: number };

export function checkBody(body: string): BodyCheck {
	const bytes = byteLength(body);
	if (body.trim().length === 0) return { ok: false, reason: 'empty', bytes };
	if (BIDI.test(body)) return { ok: false, reason: 'bidi', bytes };
	if (bytes > MAX_BODY_BYTES) return { ok: false, reason: 'too_long', bytes };
	return { ok: true, bytes };
}
