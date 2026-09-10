import { describe, expect, test } from 'bun:test';
import { localizePath, localizeUrl, resolveLocale, resolveRedirect } from './url';

const chainName = import.meta.env.PUBLIC_CHAIN_SHORT;

interface urlTest {
	input: string;
	expected: string;
	params?: Record<string, string>;
}

describe('localizePath', () => {
	test('handles default cases', () => {
		const tests: urlTest[] = [
			{ input: '/', expected: `/en/${chainName}` },
			{ input: '/en', expected: `/en/${chainName}` },
			{ input: `/en/${chainName}`, expected: `/en/${chainName}` },
			{ input: '/send', expected: `/en/${chainName}/send` },
			{ input: '/account/test', expected: `/en/${chainName}/account/test` },
			{ input: '/ko', expected: `/ko/${chainName}` },
			{ input: `/ko/${chainName}`, expected: `/ko/${chainName}` }
		];
		for (const { input, expected, params } of tests) {
			expect(localizePath(input, params)).toBe(expected);
		}
	});
	test('handles default locale', () => {
		const params = { defaultLocale: 'ko' };
		const tests: urlTest[] = [
			{ input: '/', expected: `/ko/${chainName}`, params },
			{ input: '/en', expected: `/en/${chainName}`, params },
			{ input: `/en/${chainName}`, expected: `/en/${chainName}`, params },
			{ input: '/send', expected: `/ko/${chainName}/send`, params },
			{ input: '/account/test', expected: `/ko/${chainName}/account/test`, params },
			{ input: '/ko', expected: `/ko/${chainName}`, params },
			{ input: `/ko/${chainName}`, expected: `/ko/${chainName}`, params }
		];
		for (const { input, expected, params } of tests) {
			expect(
				localizePath(input, params),
				`input: ${input}, params: ${JSON.stringify(params)}`
			).toBe(expected);
		}
	});
	test('handles forced locale', () => {
		const params = { forceLocale: 'ko' };
		const tests: urlTest[] = [
			{ input: '/', expected: `/ko/${chainName}`, params },
			{ input: '/en', expected: `/ko/${chainName}`, params },
			{ input: `/en/${chainName}`, expected: `/ko/${chainName}`, params },
			{ input: '/send', expected: `/ko/${chainName}/send`, params },
			{ input: '/account/test', expected: `/ko/${chainName}/account/test`, params },
			{ input: '/ko', expected: `/ko/${chainName}`, params },
			{ input: `/ko/${chainName}`, expected: `/ko/${chainName}`, params }
		];
		for (const { input, expected, params } of tests) {
			expect(localizePath(input, params)).toBe(expected);
		}
	});
});

describe('localizeUrl', () => {
	test('handles default cases', () => {
		const tests: urlTest[] = [
			{ input: 'https://test.com/', expected: `https://test.com/en/${chainName}` },
			{ input: 'https://test.com/en', expected: `https://test.com/en/${chainName}` },
			{ input: `https://test.com/en/${chainName}`, expected: `https://test.com/en/${chainName}` },
			{ input: 'https://test.com/send', expected: `https://test.com/en/${chainName}/send` },
			{
				input: 'https://test.com/account/test',
				expected: `https://test.com/en/${chainName}/account/test`
			},
			{ input: 'https://test.com/ko', expected: `https://test.com/ko/${chainName}` },
			{ input: `https://test.com/ko/${chainName}`, expected: `https://test.com/ko/${chainName}` }
		];
		for (const { input, expected, params } of tests) {
			expect(localizeUrl(input, params)).toBe(expected);
		}
	});
	test('handles default locale', () => {
		const params = { defaultLocale: 'ko' };
		const tests: urlTest[] = [
			{ input: 'https://test.com/', expected: `https://test.com/ko/${chainName}`, params },
			{ input: 'https://test.com/en', expected: `https://test.com/en/${chainName}`, params },
			{
				input: `https://test.com/en/${chainName}`,
				expected: `https://test.com/en/${chainName}`,
				params
			},
			{ input: 'https://test.com/send', expected: `https://test.com/ko/${chainName}/send`, params },
			{
				input: 'https://test.com/account/test',
				expected: `https://test.com/ko/${chainName}/account/test`,
				params
			},
			{ input: 'https://test.com/ko', expected: `https://test.com/ko/${chainName}`, params },
			{
				input: `https://test.com/ko/${chainName}`,
				expected: `https://test.com/ko/${chainName}`,
				params
			}
		];
		for (const { input, expected, params } of tests) {
			expect(localizeUrl(input, params), `input: ${input}, params: ${JSON.stringify(params)}`).toBe(
				expected
			);
		}
	});
});

describe('resolveLocale', () => {
	test('URL locale wins over cookie', () => {
		expect(resolveLocale('/en/vaulta', 'zh')).toBe('en');
		expect(resolveLocale('/zh/vaulta', 'en')).toBe('zh');
		expect(resolveLocale('/ko/vaulta/staking', 'zh')).toBe('ko');
	});
	test('cookie decides locale-less paths', () => {
		expect(resolveLocale('/', 'zh')).toBe('zh');
		expect(resolveLocale('/vaulta', 'ko')).toBe('ko');
		expect(resolveLocale('/staking', 'zh')).toBe('zh');
	});
	test('explicit en cookie is honored', () => {
		expect(resolveLocale('/', 'en')).toBe('en');
		expect(resolveLocale('/vaulta', 'en')).toBe('en');
	});
	test('invalid or missing cookie falls back to default', () => {
		expect(resolveLocale('/', 'xx')).toBe('en');
		expect(resolveLocale('/vaulta', undefined)).toBe('en');
		expect(resolveLocale('/vaulta')).toBe('en');
	});
});

describe('resolveRedirect', () => {
	test('returns nothing for canonical paths', () => {
		expect(resolveRedirect(`/en/${chainName}/staking`)).toBeNull();
		expect(resolveRedirect(`/en/${chainName}/api/network`)).toBeNull();
	});
	test('permanently redirects unlocalized and renamed paths', () => {
		expect(resolveRedirect('/')).toEqual({
			location: `/en/${chainName}`,
			status: 301,
			cacheable: false
		});
		expect(resolveRedirect(`/${chainName}/staking`)).toEqual({
			location: `/en/${chainName}/staking`,
			status: 301,
			cacheable: false
		});
		expect(resolveRedirect('/en/eos/account/a')).toEqual({
			location: '/en/vaulta/account/a',
			status: 301,
			cacheable: true
		});
		expect(resolveRedirect('/earn')).toEqual({
			location: `/en/${chainName}/staking`,
			status: 301,
			cacheable: false
		});
	});
	test('temporarily redirects when the cookie locale changes the destination', () => {
		expect(resolveRedirect('/', 'ko')).toEqual({
			location: `/ko/${chainName}`,
			status: 302,
			cacheable: false
		});
		expect(resolveRedirect(`/${chainName}/staking`, 'ko')).toEqual({
			location: `/ko/${chainName}/staking`,
			status: 302,
			cacheable: false
		});
	});
	test('a locale in the path wins over the cookie', () => {
		expect(resolveRedirect(`/en/${chainName}/staking`, 'ko')).toBeNull();
	});
	test('keeps a matching cookie locale permanent', () => {
		expect(resolveRedirect(`/${chainName}/staking`, 'en')).toEqual({
			location: `/en/${chainName}/staking`,
			status: 301,
			cacheable: false
		});
	});
});
