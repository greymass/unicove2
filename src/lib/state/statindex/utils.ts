export type StatWindow = '30d' | '90d' | '365d' | 'all';

// Exactly the spans the service serves from materialized fast paths — no 7d/14d
export const STAT_WINDOWS: StatWindow[] = ['30d', '90d', '365d', 'all'];
export const DEFAULT_STAT_WINDOW: StatWindow = '30d';

const WINDOW_DAYS: Record<Exclude<StatWindow, 'all'>, number> = {
	'30d': 30,
	'90d': 90,
	'365d': 365
};

export function windowStart(window: StatWindow, now: Date = new Date()): string {
	if (window === 'all') {
		return '2010-01-01';
	}
	const start = new Date(now.getTime() - WINDOW_DAYS[window] * 24 * 60 * 60 * 1000);
	return start.toISOString().slice(0, 10);
}

export function windowGranularity(window: StatWindow): 'daily' | 'monthly' {
	return window === 'all' ? 'monthly' : 'daily';
}

// Drops the trailing in-progress bucket (today for daily, current month for monthly) whose partial data would read as a sharp decline.
export function stripIncompletePeriod<T extends { date: string }>(
	entries: T[],
	window: StatWindow,
	now: Date = new Date()
): T[] {
	const keyLength = window === 'all' ? 7 : 10;
	const current = now.toISOString().slice(0, keyLength);
	return entries.filter((entry) => entry.date.slice(0, keyLength) < current);
}
