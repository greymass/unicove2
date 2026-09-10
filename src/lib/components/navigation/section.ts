export type NavSection = 'wallet' | 'explorer';

export interface NavTarget {
	href: string;
	match?: string[];
}

const EXPLORER_SEGMENTS = [
	'network',
	'governance',
	'producers',
	'sentiment',
	'block',
	'contract',
	'key',
	'msig',
	'transaction',
	'token'
];

export function isActive(
	pathname: string,
	item: NavTarget,
	itemSection?: NavSection,
	routeSection?: NavSection
): boolean {
	if (!item.href) return false;
	// A wallet path can prefix-match an explorer item (/account/<you> vs /account)
	if (itemSection && routeSection && itemSection !== routeSection) return false;
	return [item.href, ...(item.match ?? [])].some(
		(p) => pathname === p || pathname.startsWith(p + '/')
	);
}

export function sectionOf(pathname: string, network: string, sessionAccount?: string): NavSection {
	const parts = pathname.split('/');
	const i = parts.indexOf(network);
	const segment = (i >= 0 ? parts[i + 1] : parts[2]) ?? '';
	if (segment === 'account') {
		const name = i >= 0 ? parts[i + 2] : parts[3];
		return sessionAccount && name === sessionAccount ? 'wallet' : 'explorer';
	}
	return EXPLORER_SEGMENTS.includes(segment) ? 'explorer' : 'wallet';
}
