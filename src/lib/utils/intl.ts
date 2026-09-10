import type { Int } from '@wharfkit/antelope';
import { browser } from '$app/environment';
import { loadLocale } from 'wuchale/load-utils';
import { locales } from 'virtual:wuchale/locales';

const defaultDateOptions: Intl.DateTimeFormatOptions = {
	dateStyle: 'short',
	timeStyle: 'long'
};

const defaultNumberOptions: Intl.NumberFormatOptions = {};

export const intlMap: Record<string, string> = {
	en: 'en-US',
	zh: 'zh-CN',
	ko: 'ko-KR'
};

export type IntlNumberTypes = number | Int;

function getLocale(tag: string): string {
	return intlMap[tag] || 'en-US';
}

export function formatNumber(
	number: IntlNumberTypes,
	tag: string,
	options?: Intl.NumberFormatOptions
): string {
	const locale = getLocale(tag);
	return new Intl.NumberFormat(locale, {
		...defaultNumberOptions,
		...options
	}).format(Number(number));
}

export function formatDateTime(
	datetime: Date,
	tag: string,
	options?: Intl.DateTimeFormatOptions
): string {
	const locale = getLocale(tag);
	return new Intl.DateTimeFormat(locale, {
		...defaultDateOptions,
		...options
	}).format(datetime);
}

/**
 * Load wuchale locale in nested layout.ts load functions
 */
export async function useLocale(locale?: string) {
	if (browser && locale && locales.includes(locale)) {
		await loadLocale(locale);
	}
}
