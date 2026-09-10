import { Bytes, Serializer } from '@wharfkit/antelope';
import { Types } from '$lib/wharf/contracts/forum';
import { normalizeBody, titleFor, tupleFor, type Target } from './model';

export interface PostFields {
	title: string;
	body: string;
	tags: string[];
}

export function packContent(fields: PostFields): string {
	const bytes = Serializer.encode({ object: Types.post_content.from(fields) }).array;
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

export function unpackContent(content: string): PostFields {
	const binary = atob(content);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	const decoded = Serializer.decode({ type: Types.post_content, data: Bytes.from(bytes) });
	return {
		title: String(decoded.title),
		body: String(decoded.body),
		tags: decoded.tags.map((t) => String(t))
	};
}

export function buildComment(target: Target, body: string): PostFields {
	return { title: titleFor(target), body: normalizeBody(body), tags: [...tupleFor(target)] };
}
