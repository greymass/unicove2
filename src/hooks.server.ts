import { sequence } from '@sveltejs/kit/hooks';
import { sourceLanguageTag, availableLanguageTags } from '$lib/paraglide/runtime';
import { i18n } from '$lib/i18n';
import type { Handle, RequestEvent } from '@sveltejs/kit';

export const i18nHandle = i18n.handle();
type HandleParams = Parameters<Handle>[0];

export function getHeaderLang(event: RequestEvent) {
	const acceptLanguage = event.request.headers.get('accept-language');
	const locales =
		acceptLanguage?.split(',')?.map((lang: string) => lang.split(';')[0].split('-')[0].trim()) ??
		[];
	for (const locale of locales) {
		if (availableLanguageTags.includes(locale)) {
			return locale;
		}
	}
	return null;
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);
	if (/^\/[a-z0-9]+\/api/gm.test(pathname)) {
		return await resolve(event);
	}
	const pathLang = pathname.match(/[^/]+?(?=\/|$)/);
	const matchedLang = pathLang ? pathLang[0].toLowerCase() : null;
	let lang = availableLanguageTags.find((l) => l.toLowerCase() === matchedLang);
	if (!lang) {
		lang = getHeaderLang(event) || sourceLanguageTag;
		event.locals.lang = lang;
		const pathnameWithoutLang = pathLang ? pathname.replace(`/${pathLang}`, '') : pathname;
		return new Response(undefined, {
			headers: { Location: `/${lang}${pathnameWithoutLang}${search}` },
			status: 301
		});
	}
	event.locals.lang = lang;
	const response = await resolve(event);
	return response;
}

export const handle: Handle = sequence(i18nHandle, redirectHandle);
