import { GOVERNANCE_CHANNEL } from './model';

export interface Message {
	seq: number;
	block_num: number;
	trx_id?: string;
	timestamp: string;
	sender: string;
	channel: string;
	content: string;
	type?: string;
	edited_at?: string;
	deleted?: boolean;
	reply_to?: number;
	title?: string;
	body?: string;
	tags?: string[];
}

export interface MessagePreview {
	seq: number;
	sender: string;
	content: string;
	body?: string;
	deleted?: boolean;
}

export interface TagSummary {
	tags: string[];
	count: number;
	last_activity?: string;
	last_message?: MessagePreview;
}

export class DiscussionUnavailable extends Error {
	constructor() {
		super('Discussion is unavailable on this network');
	}
}

export interface MessagesQuery {
	tuple: readonly string[];
	limit?: number;
	before?: number;
	after?: number;
	includeDeleted?: boolean;
}

async function get<T>(fetchFn: typeof fetch, url: string): Promise<T> {
	const response = await fetchFn(url);
	if (response.status === 503) throw new DiscussionUnavailable();
	if (!response.ok) throw new Error(`Discussion API responded ${response.status}`);
	return (await response.json()) as T;
}

export async function fetchMessages(
	fetchFn: typeof fetch,
	apiBase: string,
	query: MessagesQuery
): Promise<{ messages: Message[]; has_more: boolean }> {
	const params = new URLSearchParams({
		channel: GOVERNANCE_CHANNEL,
		tags: query.tuple.slice(0, 3).join(','),
		omit_content: 'true'
	});
	if (query.limit !== undefined) params.set('limit', String(query.limit));
	if (query.before !== undefined) params.set('before', String(query.before));
	if (query.after !== undefined) params.set('after', String(query.after));
	if (query.includeDeleted) params.set('include_deleted', 'true');
	return get(fetchFn, `${apiBase}/get_messages?${params}`);
}

export async function checkDiscussionAvailable(
	fetchFn: typeof fetch,
	apiBase: string
): Promise<void> {
	const params = new URLSearchParams({ channel: GOVERNANCE_CHANNEL, tags: 'probe,probe,probe' });
	await get(fetchFn, `${apiBase}/get_tag_summary?${params}`);
}

export async function resolveEmptyQuery<T>(
	fetchFn: typeof fetch,
	apiBase: string,
	probe: boolean
): Promise<T[]> {
	if (probe) await checkDiscussionAvailable(fetchFn, apiBase);
	return [];
}

export async function fetchTagSummaries(
	fetchFn: typeof fetch,
	apiBase: string,
	tuples: readonly (readonly string[])[]
): Promise<TagSummary[]> {
	if (tuples.length === 0) return [];
	const params = new URLSearchParams({ channel: GOVERNANCE_CHANNEL });
	for (const tuple of tuples) params.append('tags', tuple.slice(0, 3).join(','));
	const data = await get<{ summaries: TagSummary[] }>(
		fetchFn,
		`${apiBase}/get_tag_summary?${params}`
	);
	return data.summaries;
}

export function chainDate(timestamp: string): Date {
	return new Date(/[Zz+]/.test(timestamp) ? timestamp : `${timestamp}Z`);
}
