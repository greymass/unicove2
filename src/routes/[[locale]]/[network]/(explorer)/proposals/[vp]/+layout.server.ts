import { error } from '@sveltejs/kit';
import { getCacheHeaders } from '$lib/utils';
import { localizeUrl } from '$lib/utils/url';
import { fetchVpFile, fetchVpIndex, VpFetchError } from '$lib/vp/fetch';
import { prepareVpDocument } from '$lib/vp/document';
import { vpBranchForRef } from '$lib/vp/links';
import { findVpSummary, selectVpFile } from '$lib/vp/resolve';
import { mergeVpRevisions, parseVpRevisions, sortVpRevisionsNewestFirst } from '$lib/vp/revisions';
import type { LayoutServerLoad } from './$types';

function indexErrorMessage(e: unknown): string {
	const code = e instanceof VpFetchError ? e.code : null;
	if (code === 'unreachable') {
		return 'The proposals repository could not be reached.';
	}
	return 'The proposal index could not be read.';
}

function documentErrorMessage(e: unknown): string {
	const code = e instanceof VpFetchError ? e.code : null;
	if (code === 'unreachable') {
		return 'The proposals repository could not be reached.';
	}
	if (code === 'document-missing') {
		return 'The proposal index lists this proposal, but its document is missing.';
	}
	return 'That proposal could not be read.';
}

export const load: LayoutServerLoad = async ({ fetch, locals, params, setHeaders, url }) => {
	if (!locals.network.supports('proposals')) {
		error(404, 'Not found');
	}

	setHeaders(getCacheHeaders(300));

	const locale = params.locale ?? 'en';
	const branch = vpBranchForRef(params.vp);

	let index;
	try {
		index = await fetchVpIndex(fetch, branch);
	} catch (e) {
		error(503, indexErrorMessage(e));
	}

	const summary = findVpSummary(index, params.vp);
	if (!summary) {
		error(404, 'That proposal number does not exist.');
	}

	const picked = selectVpFile(summary, locale);

	let raw: string;
	try {
		raw = await fetchVpFile(fetch, picked.path, branch);
	} catch (e) {
		const status = e instanceof VpFetchError ? e.status : 503;
		error(status, documentErrorMessage(e));
	}

	const { title, body } = prepareVpDocument(raw);
	const heading = title ?? summary.title;

	const localizedRevisions = parseVpRevisions(raw);
	let revisions = localizedRevisions;
	if (picked.lang !== 'en' && picked.stale) {
		try {
			const englishRaw = await fetchVpFile(fetch, summary.path, branch);
			revisions = mergeVpRevisions(parseVpRevisions(englishRaw), localizedRevisions);
		} catch {
			// English fetch failed; degrade to the localized entries already parsed above.
		}
	}
	revisions = sortVpRevisionsNewestFirst(revisions);

	// A proposal resolves at both vp-0001 and vp-0001-slug, so point search engines at the number.
	const canonical = new URL(url);
	const segments = canonical.pathname.split('/');
	const vpSegment = segments.findIndex((s) => s.toLowerCase() === params.vp.toLowerCase());
	if (vpSegment !== -1) segments[vpSegment] = summary.vp.toLowerCase();
	canonical.pathname = segments.join('/');
	canonical.search = '';

	return {
		summary,
		body,
		title: heading,
		subtitle: summary.vp,
		lang: picked.lang,
		stale: picked.stale,
		revisions,
		branch,
		pageMetaTags: {
			title: `${summary.vp}: ${heading}`,
			description: `Read "${heading}", a Vaulta network proposal published for public review.`,
			url: localizeUrl(String(canonical))
		}
	};
};
