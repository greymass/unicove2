import * as v from 'valibot';
import { command, getRequestEvent } from '$app/server';
import { LOCALES } from '$lib/constants/locales';

export const setLocale = command(v.picklist(LOCALES), async (locale: string) => {
	const request = getRequestEvent();
	request.cookies.set('locale', locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: false,
		secure: request.url.protocol === 'https:',
		sameSite: 'lax'
	});
	return { saved: true };
});
