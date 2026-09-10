import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { DEFAULT_LOCALE, LOCALES } from '$lib/constants/locales';

const renamedNetworks: Record<string, string> = {
	eos: 'vaulta'
};

function isWellKnownFile(pathname: string) {
	return pathname.startsWith('/.well-known/');
}

function isSveltePath(pathname: string) {
	return pathname.startsWith('/_app') || pathname.includes('__data.json');
}

const redirects: Record<string, string> = {
	'/earn': '/staking',
	'/resources/ram/buy': '/ram/buy',
	'/resources/ram/sell': '/ram/sell',
	'/swap/eosio/4,eos/core.vaulta/4,a': '/swap/eosio.token/4,eos/core.vaulta/4,a'
};

function skipRedirect(pathname: string) {
	return isSveltePath(pathname) || isWellKnownFile(pathname) || pathname.endsWith('.xml');
}

function getManualRedirectPath(pathMore: string[]): string {
	const pathname = '/' + pathMore.join('/');
	return redirects[pathname];
}

function isManualRedirectPath(pathMore: string[]): boolean {
	const pathname = '/' + pathMore.join('/');
	return pathname in redirects;
}

interface LocalizePathOptions {
	defaultLocale?: string;
	forceLocale?: string;
	forceNetwork?: string;
}

/**
 * Localize a URL path to always return format: /[lang]/[network]/[more]
 * Handles all permutations and adds defaults where needed
 */
export function localizePath(pathname: string, options: LocalizePathOptions = {}): string {
	const { defaultLocale, forceLocale, forceNetwork } = options;

	if (skipRedirect(pathname)) {
		return pathname;
	}

	let network = forceNetwork || PUBLIC_CHAIN_SHORT;
	if (!network) {
		throw new Error('PUBLIC_CHAIN_SHORT is not defined and forceNetwork not provided');
	}

	const [, pathFirst, pathSecond, ...pathMore] = pathname.split('/').map((p) => p.trim());

	let locale = forceLocale || defaultLocale || DEFAULT_LOCALE;
	const remainingPath: string[] = [];

	const isFirstLang = LOCALES.includes(pathFirst);
	if (isFirstLang && !forceLocale) {
		locale = pathFirst;
	}

	if (!pathFirst) {
		return `/${locale}/${network}`;
	}

	const isFirstNetwork = pathFirst === network || pathFirst in renamedNetworks;
	const isSecondNetwork = pathSecond && (pathSecond === network || pathSecond in renamedNetworks);

	if (isFirstLang && isSecondNetwork) {
		network = renamedNetworks[pathSecond] || pathSecond;
		remainingPath.push(...pathMore);
	} else if (isFirstLang && !isSecondNetwork) {
		if (pathSecond) remainingPath.push(pathSecond);
		remainingPath.push(...pathMore);
	} else if (isFirstNetwork && !pathSecond) {
		network = renamedNetworks[pathFirst] || pathFirst;
	} else if (isFirstNetwork && pathSecond) {
		network = renamedNetworks[pathFirst] || pathFirst;
		remainingPath.push(pathSecond);
		remainingPath.push(...pathMore);
	} else {
		if (pathFirst) remainingPath.push(pathFirst);
		if (pathSecond) remainingPath.push(pathSecond);
		remainingPath.push(...pathMore);
	}

	let url = `/${locale}/${network}`;

	if (remainingPath.length > 0) {
		const remainingPathname = remainingPath.filter(Boolean);
		if (isManualRedirectPath(remainingPathname)) {
			url += getManualRedirectPath(remainingPathname);
		} else {
			url += `/${remainingPathname.join('/')}`;
		}
	}

	return url;
}

/**
 * Localize a full URL ensuring it has locale and network in the path
 */
export function localizeUrl(urlString: string, options: LocalizePathOptions = {}): string {
	const url = new URL(urlString);
	url.pathname = localizePath(url.pathname, options);
	return String(url);
}

export function resolveLocale(pathname: string, cookieLocale?: string): string {
	const [, first] = pathname.split('/');
	if (LOCALES.includes(first)) {
		return first;
	}
	if (cookieLocale && LOCALES.includes(cookieLocale)) {
		return cookieLocale;
	}
	return DEFAULT_LOCALE;
}

export interface RedirectTarget {
	location: string;
	status: 301 | 302;
	cacheable: boolean;
}

// Permanent unless the cookie locale alone is what moves the request.
export function resolveRedirect(pathname: string, cookieLocale?: string): RedirectTarget | null {
	if (pathname.includes('/api/')) return null;
	const network = PUBLIC_CHAIN_SHORT;
	const canonical = localizePath(pathname, { forceNetwork: network });
	const preferred = localizePath(pathname, {
		forceNetwork: network,
		forceLocale: resolveLocale(pathname, cookieLocale)
	});
	if (pathname === preferred) return null;
	const status = preferred === canonical ? 301 : 302;
	// Shared caches key on URL only, so a redirect the cookie could change must not be cached.
	const cacheable = status === 301 && LOCALES.includes(pathname.split('/')[1]);
	return { location: preferred, status, cacheable };
}
