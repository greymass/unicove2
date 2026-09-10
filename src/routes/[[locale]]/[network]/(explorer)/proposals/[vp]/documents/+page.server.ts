import { error } from '@sveltejs/kit';
import { localizeUrl } from '$lib/utils/url';
import { fetchVpFile } from '$lib/vp/fetch';
import {
	prepareVpExhibit,
	selectVpDocumentFile,
	vpDocumentHeading,
	vpDocumentStem
} from '$lib/vp/documents';
import type { PageServerLoad } from './$types';

export interface VpDocumentListing {
	stem: string;
	heading: string;
	statusLine: string | null;
	words: number | null;
	minutes: number | null;
}

export const load: PageServerLoad = async ({ fetch, params, parent, url }) => {
	const { summary, branch } = await parent();
	if (!summary.documents.length) {
		error(404, 'This proposal has no documents.');
	}
	const locale = params.locale ?? 'en';

	const listings: VpDocumentListing[] = await Promise.all(
		summary.documents.map(async (doc): Promise<VpDocumentListing> => {
			const stem = vpDocumentStem(doc.path);
			const picked = selectVpDocumentFile(doc, locale);
			try {
				const exhibit = prepareVpExhibit(await fetchVpFile(fetch, picked.path, branch));
				return {
					stem,
					heading: exhibit.heading ?? vpDocumentHeading(doc),
					statusLine: exhibit.statusLine,
					words: exhibit.words,
					minutes: exhibit.minutes
				};
			} catch {
				// The hub still lists the document; its page reports the fetch failure properly.
				return {
					stem,
					heading: vpDocumentHeading(doc),
					statusLine: null,
					words: null,
					minutes: null
				};
			}
		})
	);

	return {
		documentListings: listings,
		pageMetaTags: {
			title: `${summary.vp}: Documents`,
			description: `The documents of Vaulta network proposal ${summary.vp}.`,
			url: localizeUrl(String(url))
		}
	};
};
