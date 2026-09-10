import { describe, expect, test } from 'bun:test';
import { TokenDefinition, parseTokenDefinitions } from './token';

const legacyHex = '02044a554e474c4500000100a6823403ea305504454f5300000000000100a6823403ea3055';

describe('parseTokenDefinitions', () => {
	test('returns empty list for undefined or empty input', () => {
		expect(parseTokenDefinitions(undefined)).toEqual([]);
		expect(parseTokenDefinitions('')).toEqual([]);
	});

	test('parses a JSON array of token definitions', () => {
		const tokens = parseTokenDefinitions(
			'[{"symbol":"0,V","contract":"token.rms"},{"symbol":"4,CLOAK","contract":"thezeostoken"}]'
		);
		expect(tokens).toHaveLength(2);
		expect(tokens[0]).toBeInstanceOf(TokenDefinition);
		expect(String(tokens[0].symbol)).toBe('0,V');
		expect(String(tokens[0].contract)).toBe('token.rms');
		expect(String(tokens[1].symbol)).toBe('4,CLOAK');
		expect(String(tokens[1].contract)).toBe('thezeostoken');
	});

	test('parses the legacy ABI-encoded hex format', () => {
		const tokens = parseTokenDefinitions(legacyHex);
		expect(tokens).toHaveLength(2);
		expect(String(tokens[0].symbol)).toBe('4,JUNGLE');
		expect(String(tokens[0].contract)).toBe('eosio.token');
		expect(String(tokens[1].symbol)).toBe('4,EOS');
		expect(String(tokens[1].contract)).toBe('eosio.token');
	});

	test('JSON and hex formats decode to equivalent structs', () => {
		const fromHex = parseTokenDefinitions(legacyHex);
		const fromJson = parseTokenDefinitions(
			'[{"symbol":"4,JUNGLE","contract":"eosio.token"},{"symbol":"4,EOS","contract":"eosio.token"}]'
		);
		expect(JSON.stringify(fromJson)).toBe(JSON.stringify(fromHex));
	});
});
