import { describe, expect, test } from 'bun:test';
import type { HastNode } from 'svelte-exmarkdown';
import { assignHeadingIds, headingText } from './headings';

function text(value: string): HastNode {
	return { type: 'text', value } as HastNode;
}

function element(tagName: string, children: HastNode[]): HastNode {
	return { type: 'element', tagName, properties: {}, children } as HastNode;
}

function root(children: HastNode[]): HastNode {
	return { type: 'root', children } as HastNode;
}

function idOf(node: HastNode): unknown {
	return (node as { properties?: Record<string, unknown> }).properties?.id;
}

describe('headingText', () => {
	test('joins the text of nested inline nodes', () => {
		const heading = element('h2', [
			text('Bounds on '),
			element('code', [text('max_ram_size')]),
			text(' growth')
		]);
		expect(headingText(heading)).toBe('Bounds on max_ram_size growth');
	});

	test('ignores comment and raw nodes', () => {
		const heading = element('h2', [
			text('Overview'),
			{ type: 'comment', value: ' hidden ' } as HastNode
		]);
		expect(headingText(heading)).toBe('Overview');
	});
});

describe('assignHeadingIds', () => {
	test('assigns slug ids to h2, h3 and h4', () => {
		const h2 = element('h2', [text('Bounds on the Endowment')]);
		const h3 = element('h3', [text('Rationale')]);
		const h4 = element('h4', [text('Notes')]);
		assignHeadingIds(root([h2, h3, h4]));
		expect(idOf(h2)).toBe('bounds-on-the-endowment');
		expect(idOf(h3)).toBe('rationale');
		expect(idOf(h4)).toBe('notes');
	});

	test('assigns slug ids to h5 and h6', () => {
		const h5 = element('h5', [text('Edge Cases')]);
		const h6 = element('h6', [text('Fine Print')]);
		assignHeadingIds(root([h5, h6]));
		expect(idOf(h5)).toBe('edge-cases');
		expect(idOf(h6)).toBe('fine-print');
	});

	test('disambiguates an h5 colliding with an earlier heading level', () => {
		const h2 = element('h2', [text('Notes')]);
		const h5 = element('h5', [text('Notes')]);
		assignHeadingIds(root([h2, h5]));
		expect(idOf(h2)).toBe('notes');
		expect(idOf(h5)).toBe('notes-1');
	});

	test('assigns ids to h1s so exhibit part headings anchor', () => {
		const h1 = element('h1', [text('PART 1')]);
		assignHeadingIds(root([h1]));
		expect(idOf(h1)).toBe('part-1');
	});

	test('leaves other elements alone', () => {
		const paragraph = element('p', [text('Body copy')]);
		assignHeadingIds(root([paragraph]));
		expect(idOf(paragraph)).toBeUndefined();
	});

	test('disambiguates repeated headings across the whole document', () => {
		const first = element('h2', [text('Overview')]);
		const second = element('h3', [text('Overview')]);
		assignHeadingIds(root([element('section', [first]), second]));
		expect(idOf(first)).toBe('overview');
		expect(idOf(second)).toBe('overview-1');
	});

	test('restarts numbering for each document', () => {
		const a = element('h2', [text('Overview')]);
		const b = element('h2', [text('Overview')]);
		assignHeadingIds(root([a]));
		assignHeadingIds(root([b]));
		expect(idOf(a)).toBe('overview');
		expect(idOf(b)).toBe('overview');
	});

	test('finds headings nested inside other elements', () => {
		const nested = element('h2', [text('Deep Heading')]);
		assignHeadingIds(root([element('div', [element('section', [nested])])]));
		expect(idOf(nested)).toBe('deep-heading');
	});
});
