import { describe, expect, test } from 'bun:test';
import { prepareVpDocument } from './document';

const fixture = await Bun.file(new URL('./fixtures/proposal.md', import.meta.url).pathname).text();

describe('prepareVpDocument', () => {
	test('strips frontmatter', () => {
		const { body } = prepareVpDocument(fixture);
		expect(body.startsWith('---')).toBe(false);
		expect(body).not.toContain('standard: VPS-1');
	});

	test('extracts the H1 as the title', () => {
		const { title } = prepareVpDocument(fixture);
		expect(title).toBe('Network RAM Endowment for Account Onboarding');
	});

	test('removes the H1 from the body', () => {
		const { body } = prepareVpDocument(fixture);
		expect(body).not.toContain('# Network RAM Endowment');
	});

	test('removes the language navigation line', () => {
		const { body } = prepareVpDocument(fixture);
		expect(body).not.toContain('[한국어](proposal.ko.md)');
	});

	test('keeps the first real section', () => {
		const { body } = prepareVpDocument(fixture);
		expect(body.trimStart().startsWith('## Summary')).toBe(true);
	});

	test('handles a document with no frontmatter', () => {
		const { title, body } = prepareVpDocument('# Title\n\n## Section\n');
		expect(title).toBe('Title');
		expect(body.trim()).toBe('## Section');
	});

	test('returns a null title when there is no H1', () => {
		const { title, body } = prepareVpDocument('## Section\n');
		expect(title).toBeNull();
		expect(body.trim()).toBe('## Section');
	});

	test('leaves a translated title intact', () => {
		const { title } = prepareVpDocument('---\nlang: ko\n---\n\n# 계정 온보딩\n\n## 요약\n');
		expect(title).toBe('계정 온보딩');
	});

	test('preserves a single proposal link in the body', () => {
		const { body } = prepareVpDocument(
			'# Title\n\n[See the companion proposal](proposal.md)\n\n## Section\n'
		);
		expect(body).toContain('[See the companion proposal](proposal.md)');
	});

	test('strips trailing ATX closing hashes from title', () => {
		const { title: title1 } = prepareVpDocument('# Title ###\n');
		expect(title1).toBe('Title');

		const { title: title2 } = prepareVpDocument('# C#\n');
		expect(title2).toBe('C#');
	});

	test('strips bare trailing whitespace from title', () => {
		const { title } = prepareVpDocument('# Title  \n');
		expect(title).toBe('Title');
		expect(title?.endsWith(' ')).toBe(false);
	});

	test('handles CRLF-terminated H1 correctly', () => {
		const { title } = prepareVpDocument('# Title\r\n');
		expect(title).toBe('Title');
		expect(title?.includes('\r')).toBe(false);
	});
});
