import { describe, expect, test } from 'bun:test';
import { buildComment, packContent, unpackContent } from './content';

describe('packContent', () => {
	test('round-trips title, body, and tags through base64', () => {
		const fields = {
			title: 'msig greymass/vp42',
			body: 'Hello **world**',
			tags: ['msig', 'greymass', 'vp42']
		};
		const packed = packContent(fields);
		expect(packed).toMatch(/^[A-Za-z0-9+/]+=*$/);
		expect(unpackContent(packed)).toEqual(fields);
	});
	test('round-trips multibyte bodies', () => {
		const fields = { title: 't', body: '한국어 テスト ✓', tags: [] };
		expect(unpackContent(packContent(fields))).toEqual(fields);
	});
	test('packed length is close to the serialized size', () => {
		const body = 'a'.repeat(1000);
		const packed = packContent({ title: 'msig a/b', body, tags: ['msig', 'a', 'b'] });
		expect(packed.length).toBeGreaterThan(1000);
		expect(packed.length).toBeLessThan(1500);
	});
});

describe('buildComment', () => {
	test('fills the hidden title and the tuple, normalizing the body', () => {
		expect(
			buildComment({ kind: 'topic', contract: 'sentiment.gm', topic: 'vp42' }, 'a\r\nb\t')
		).toEqual({
			title: 'topic sentiment.gm/vp42',
			body: 'a\nb    ',
			tags: ['topic', 'sentiment.gm', 'vp42']
		});
	});
});
