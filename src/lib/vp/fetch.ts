import { VP_BRANCH, vpRawBase } from './links';
import { parseVpIndex, type VpIndex } from './types';

export type VpFetchErrorCode =
	| 'unreachable'
	| 'index-unavailable'
	| 'index-invalid'
	| 'document-missing'
	| 'document-unavailable';

export class VpFetchError extends Error {
	readonly code: VpFetchErrorCode;
	readonly status: number;
	constructor(code: VpFetchErrorCode, status: number = 503) {
		super(code);
		this.name = 'VpFetchError';
		this.code = code;
		this.status = status;
	}
}

export async function fetchVpIndex(
	fetcher: typeof fetch,
	branch: string = VP_BRANCH
): Promise<VpIndex> {
	const url = `${vpRawBase(branch)}index.json`;
	let response: Response;
	try {
		response = await fetcher(url);
	} catch {
		throw new VpFetchError('unreachable');
	}
	if (!response.ok) {
		throw new VpFetchError('index-unavailable');
	}
	let index: VpIndex;
	try {
		index = parseVpIndex(await response.json());
	} catch {
		throw new VpFetchError('index-invalid');
	}
	if (index.skipped > 0) {
		console.warn(`[vp] skipped ${index.skipped} unreadable entries in ${url}`);
	}
	return index;
}

export async function fetchVpFile(
	fetcher: typeof fetch,
	path: string,
	branch: string = VP_BRANCH
): Promise<string> {
	let response: Response;
	try {
		response = await fetcher(`${vpRawBase(branch)}${path}`);
	} catch {
		throw new VpFetchError('unreachable');
	}
	if (response.status === 404) {
		throw new VpFetchError('document-missing', 404);
	}
	if (!response.ok) {
		throw new VpFetchError('document-unavailable');
	}
	return response.text();
}
