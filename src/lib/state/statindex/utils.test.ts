import { describe, expect, test } from 'bun:test';
import { stripIncompletePeriod, windowGranularity, windowStart } from './utils';

const now = new Date('2026-07-22T15:30:00Z');

describe('windowStart', () => {
	test('30d window', () => {
		expect(windowStart('30d', now)).toBe('2026-06-22');
	});

	test('90d window', () => {
		expect(windowStart('90d', now)).toBe('2026-04-23');
	});

	test('365d window', () => {
		expect(windowStart('365d', now)).toBe('2025-07-22');
	});

	test('all-time window predates every chain', () => {
		expect(windowStart('all', now)).toBe('2010-01-01');
	});

	test('crosses year boundaries', () => {
		expect(windowStart('90d', new Date('2026-02-01T00:00:00Z'))).toBe('2025-11-03');
	});
});

describe('windowGranularity', () => {
	test('short windows are daily', () => {
		expect(windowGranularity('30d')).toBe('daily');
		expect(windowGranularity('90d')).toBe('daily');
		expect(windowGranularity('365d')).toBe('daily');
	});

	test('all-time is monthly', () => {
		expect(windowGranularity('all')).toBe('monthly');
	});
});

describe('stripIncompletePeriod', () => {
	test('drops the current (incomplete) day for daily windows', () => {
		const entries = [{ date: '2026-07-20' }, { date: '2026-07-21' }, { date: '2026-07-22' }];
		expect(stripIncompletePeriod(entries, '30d', now)).toEqual([
			{ date: '2026-07-20' },
			{ date: '2026-07-21' }
		]);
	});

	test('keeps every completed day when today is absent', () => {
		const entries = [{ date: '2026-07-20' }, { date: '2026-07-21' }];
		expect(stripIncompletePeriod(entries, '30d', now)).toEqual(entries);
	});

	test('drops the current (incomplete) month for the all-time window', () => {
		const entries = [{ date: '2026-05-01' }, { date: '2026-06-01' }, { date: '2026-07-01' }];
		expect(stripIncompletePeriod(entries, 'all', now)).toEqual([
			{ date: '2026-05-01' },
			{ date: '2026-06-01' }
		]);
	});

	test('order-independent — filters by date value, not position', () => {
		const entries = [{ date: '2026-07-22' }, { date: '2026-07-19' }, { date: '2026-07-21' }];
		expect(stripIncompletePeriod(entries, '30d', now)).toEqual([
			{ date: '2026-07-19' },
			{ date: '2026-07-21' }
		]);
	});
});
