import { error } from '@sveltejs/kit';
import { localizeUrl } from '$lib/utils/url';
import { fetchVpFile, VpFetchError } from '$lib/vp/fetch';
import {
	buildVpToc,
	findVpDocument,
	prepareVpExhibit,
	selectVpDocumentFile,
	vpDocumentHeading,
	vpDocumentStem
} from '$lib/vp/documents';
import type { PageServerLoad } from './$types';

function documentErrorMessage(e: unknown): string {
	const code = e instanceof VpFetchError ? e.code : null;
	if (code === 'unreachable') {
		return 'The proposals repository could not be reached.';
	}
	if (code === 'document-missing') {
		return 'The proposal lists this document, but its file is missing.';
	}
	return 'That document could not be read.';
}

export const load: PageServerLoad = async ({ fetch, params, parent, url }) => {
	const { summary, branch } = await parent();

	const doc = findVpDocument(summary.documents, params.doc);
	if (!doc) {
		error(404, 'This proposal has no document by that name.');
	}

	const locale = params.locale ?? 'en';
	const picked = selectVpDocumentFile(doc, locale);

	let raw: string;
	try {
		raw = await fetchVpFile(fetch, picked.path, branch);
	} catch (e) {
		const status = e instanceof VpFetchError ? e.status : 503;
		error(status, documentErrorMessage(e));
	}

	const exhibit = prepareVpExhibit(raw);
	const heading = exhibit.heading ?? vpDocumentHeading(doc);
	const position = summary.documents.findIndex((d) => vpDocumentStem(d.path) === params.doc);

	return {
		document: exhibit,
		docHeading: heading,
		docLang: picked.lang,
		docStale: picked.stale,
		docPosition: position,
		toc: buildVpToc(exhibit.body),
		pageMetaTags: {
			title: `${summary.vp}: ${heading}`,
			description: `Read "${heading}", a document of Vaulta network proposal ${summary.vp}.`,
			url: localizeUrl(String(url))
		}
	};
};
