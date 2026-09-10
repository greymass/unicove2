import { Asset, type NameType } from '@wharfkit/antelope';

export * from './strings';
export * from './ricardian';
export * from './style';

export function calculateValue(balance: Asset, currency: Asset): Asset {
	return Asset.from(
		`${(currency.value * Number(balance.quantity)).toFixed(currency.symbol.precision)} ${currency.symbol.code}`
	);
}

export function getCacheHeaders(ttl: number, irreversible: boolean = false) {
	// Maintain a ttl cache by default
	let browser = `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${30}`;
	let cloudflare = `max-age=${ttl}, s-maxage=${ttl}`;

	// If the data is irreversible, set 1 year and immutable
	if (irreversible) {
		browser = `public, max-age=31536000, s-maxage=31536000, immutable`;
		cloudflare = `max-age=31536000, s-maxage=31536000`;
	}

	return {
		'cache-control': browser,
		'cloudflare-cdn-cache-control': cloudflare
	};
}

export function preventDefault<TThis>(fn: (this: TThis, event: Event) => void) {
	return function (this: TThis, event: Event) {
		event.preventDefault();
		fn.call(this, event);
	};
}

export function detectEnvironment(): 'mobile' | 'desktop' | undefined {
	if (typeof window === 'undefined') {
		// Server-side rendering
		return;
	}

	const userAgent = window.navigator.userAgent.toLowerCase();
	const mobileKeywords = [
		'android',
		'webos',
		'iphone',
		'ipad',
		'ipod',
		'blackberry',
		'windows phone'
	];

	return mobileKeywords.some((keyword) => userAgent.includes(keyword)) ? 'mobile' : 'desktop';
}

export interface TokenKeyParams {
	contract: NameType;
	symbol: NameType;
}

export function isSameToken(token1?: TokenKeyParams, token2?: TokenKeyParams): boolean {
	if (!token1 || !token2) return false;
	return (
		String(token1.contract) === String(token2.contract) &&
		String(token1.symbol) === String(token2.symbol)
	);
}
