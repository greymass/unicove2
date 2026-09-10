import { describe, expect, test } from 'bun:test';
import { PublicKey } from '@wharfkit/antelope';

import { ACCOUNT_NAME_LENGTH, buildCreationMemo, isValidCreationName } from './memo';

const KEY = 'PUB_K1_6RWZ1CmDL4B6LdixuertnzxcRuUDac3NQspJEvMnebGcXY4zZj';

describe('buildCreationMemo', () => {
	test('joins name and key with a dash', () => {
		expect(buildCreationMemo('testtest1234', KEY)).toBe(`testtest1234-${KEY}`);
	});

	test('emits the modern key format, never legacy', () => {
		const memo = buildCreationMemo('testtest1234', PublicKey.from(KEY));
		expect(memo).toContain('PUB_K1_');
		expect(memo).not.toContain('EOS');
	});

	test('accepts a PublicKey instance and a string identically', () => {
		expect(buildCreationMemo('testtest1234', PublicKey.from(KEY))).toBe(
			buildCreationMemo('testtest1234', KEY)
		);
	});
});

describe('isValidCreationName', () => {
	test('accepts a 12 character name', () => {
		expect(isValidCreationName('testtest1234')).toBe(true);
	});

	test('rejects a short name', () => {
		expect(isValidCreationName('short')).toBe(false);
	});

	test('rejects an empty name', () => {
		expect(isValidCreationName('')).toBe(false);
	});

	test('length constant is 12', () => {
		expect(ACCOUNT_NAME_LENGTH).toBe(12);
	});
});
