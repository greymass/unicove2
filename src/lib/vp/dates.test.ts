import { describe, expect, test } from 'bun:test';
import { parseVpDate } from './dates';

describe('parseVpDate', () => {
	test('yields a Date whose local calendar fields match the authored day', () => {
		const date = parseVpDate('2026-08-10');
		expect(date.getFullYear()).toBe(2026);
		expect(date.getMonth()).toBe(7);
		expect(date.getDate()).toBe(10);
	});

	test('holds across a month boundary', () => {
		const date = parseVpDate('2026-09-01');
		expect(date.getFullYear()).toBe(2026);
		expect(date.getMonth()).toBe(8);
		expect(date.getDate()).toBe(1);
	});
});
