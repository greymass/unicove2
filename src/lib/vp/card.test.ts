import { describe, expect, test } from 'bun:test';
import { parseVpIndex } from './types';
import { vpCardText } from './card';
import fixture from './fixtures/index.json';

const index = parseVpIndex(fixture);
const vp1 = index.proposals.find((p) => p.vp === 'VP-0001')!;
const vp2 = index.proposals.find((p) => p.vp === 'VP-0002')!;

describe('vpCardText', () => {
	test('en uses entry fields', () => {
		expect(vpCardText(vp1, 'en')).toEqual({
			title: 'Network RAM Endowment for Account Onboarding',
			excerpt: 'A network-owned account (ram.vaulta) holds a RAM endowment.'
		});
	});
	test('matching translation wins', () => {
		const ko = vpCardText(vp1, 'ko');
		expect(ko.title).toBe('계정 온보딩을 위한 네트워크 RAM 기금');
		expect(ko.excerpt).toBe('네트워크 소유 계정은 RAM 기금을 보유합니다.');
	});
	test('per-field fallback to English when translation lacks fields', () => {
		const zh = vpCardText(vp1, 'zh');
		expect(zh.title).toBe('Network RAM Endowment for Account Onboarding');
		expect(zh.excerpt).toBe('A network-owned account (ram.vaulta) holds a RAM endowment.');
	});
	test('old-shape entry yields no excerpt', () => {
		expect(vpCardText(vp2, 'en').excerpt).toBeUndefined();
	});
});
