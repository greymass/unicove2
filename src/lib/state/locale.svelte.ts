import { watch } from 'runed';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { LOCALES } from '$lib/constants/locales';
import { setLocale } from '$lib/remote/locale.remote';
import { localizePath } from '$lib/utils/url';
import type { SettingsState } from '$lib/state/settings.svelte.js';

export function reconcileLocale(settings: SettingsState) {
	let synced: string | null | undefined;
	watch([() => settings.data.locale, () => page.params.locale], ([preferred, current]) => {
		if (!preferred || !LOCALES.includes(preferred)) return;
		if (synced === undefined) {
			synced = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/)?.[1] ?? null;
		}
		if (synced !== preferred) {
			synced = preferred;
			setLocale(preferred);
		}
		if (current && LOCALES.includes(current)) {
			document.documentElement.lang = current;
			if (current !== preferred) {
				goto(localizePath(page.url.pathname, { forceLocale: preferred }) + page.url.search, {
					replaceState: true
				});
			}
		}
	});
}
