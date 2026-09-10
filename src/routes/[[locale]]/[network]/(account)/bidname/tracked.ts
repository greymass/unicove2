import { browser } from '$app/environment';
import { PUBLIC_BIDNAME_MAX_TRACKED } from '$env/static/public';

export const MAX_TRACKED_NAMES = parseInt(PUBLIC_BIDNAME_MAX_TRACKED, 10) || 100;

function storageKey(account: string): string {
	return `unicove_bidname_tracked_${account}`;
}

export function getTrackedNames(account: string): string[] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(storageKey(account));
		return stored ? JSON.parse(stored) : [];
	} catch {
		localStorage.removeItem(storageKey(account));
		return [];
	}
}

export function canTrackMore(account: string): boolean {
	return getTrackedNames(account).length < MAX_TRACKED_NAMES;
}

export function addTrackedName(account: string, name: string): boolean {
	const names = getTrackedNames(account);
	if (names.includes(name)) return true;
	if (names.length >= MAX_TRACKED_NAMES) return false;
	names.push(name);
	try {
		localStorage.setItem(storageKey(account), JSON.stringify(names));
	} catch {
		return false;
	}
	return true;
}

export function removeTrackedName(account: string, name: string) {
	const names = getTrackedNames(account).filter((n) => n !== name);
	try {
		localStorage.setItem(storageKey(account), JSON.stringify(names));
	} catch {
		// ignore
	}
}
