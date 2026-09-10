import { describe, expect, test } from 'bun:test';
import { Asset } from '@wharfkit/antelope';
import { abilityFor, gateFromRows, blockedFromRows } from './gate';

const gate = { tokenContract: 'core.vaulta', minBalance: Asset.from('10.0000 A') };

describe('abilityFor', () => {
	test('blocked wins over everything', () => {
		expect(abilityFor(gate, Asset.from('100.0000 A'), true)).toEqual({
			ok: false,
			reason: 'blocked'
		});
	});
	test('below the gate reports the gate and the liquid balance', () => {
		expect(abilityFor(gate, Asset.from('9.9999 A'), false)).toMatchObject({
			ok: false,
			reason: 'below_gate'
		});
	});
	test('at or above the gate is ok, and no gate is ok', () => {
		expect(abilityFor(gate, Asset.from('10.0000 A'), false)).toEqual({ ok: true });
		expect(abilityFor(null, Asset.from('0.0000 A'), false)).toEqual({ ok: true });
	});
	test('a different symbol than the gate is ok (chain enforces the gate)', () => {
		expect(abilityFor(gate, Asset.from('1.0000 EOS'), false)).toEqual({ ok: true });
	});
});

describe('row parsing', () => {
	test('gateFromRows picks the first row', () => {
		expect(gateFromRows([{ token_contract: 'core.vaulta', min_balance: '10.0000 A' }])).toEqual({
			tokenContract: 'core.vaulta',
			minBalance: Asset.from('10.0000 A')
		});
		expect(gateFromRows([])).toBeNull();
	});
	test('blockedFromRows matches the exact account', () => {
		expect(blockedFromRows([{ account: 'alice' }], 'alice')).toBe(true);
		expect(blockedFromRows([{ account: 'alicea' }], 'alice')).toBe(false);
		expect(blockedFromRows([], 'alice')).toBe(false);
	});
});
