import { describe, expect, test } from 'bun:test';
import { API, PublicKey } from '@wharfkit/antelope';

import { keyFullyControls } from './guard';

const KEY = PublicKey.from('PUB_K1_6RWZ1CmDL4B6LdixuertnzxcRuUDac3NQspJEvMnebGcXY4zZj');
const OTHER = PublicKey.from('PUB_K1_7Mcfkc9GHqdQfkmCaSpzmJcsz1Fx4f6MkQozmVxy6M4C4J3ZhP');

function row(overrides: Record<string, unknown> = {}) {
	return API.v1.AccountByAuthorizersRow.from({
		account_name: 'testtest1234',
		permission_name: 'active',
		authorizing_key: KEY,
		threshold: 1,
		weight: 1,
		...overrides
	});
}

describe('keyFullyControls', () => {
	test('matches a sole-authority row', () => {
		expect(keyFullyControls(row(), 'testtest1234', 'active', KEY)).toBe(true);
	});

	test('rejects a different account name', () => {
		expect(keyFullyControls(row(), 'otheraccount', 'active', KEY)).toBe(false);
	});

	test('rejects a different permission', () => {
		expect(keyFullyControls(row(), 'testtest1234', 'owner', KEY)).toBe(false);
	});

	test('rejects a different key', () => {
		expect(keyFullyControls(row(), 'testtest1234', 'active', OTHER)).toBe(false);
	});

	test('rejects a multisig threshold', () => {
		expect(keyFullyControls(row({ threshold: 2 }), 'testtest1234', 'active', KEY)).toBe(false);
	});

	test('rejects a partial weight', () => {
		expect(keyFullyControls(row({ threshold: 2, weight: 1 }), 'testtest1234', 'active', KEY)).toBe(
			false
		);
	});

	test('rejects an undefined key', () => {
		expect(keyFullyControls(row(), 'testtest1234', 'active', undefined)).toBe(false);
	});
});
