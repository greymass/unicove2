import type { HastNode } from 'svelte-exmarkdown';
import { createSlugger } from './slug';

const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export function headingText(node: HastNode): string {
	if (node.type === 'text') return node.value;
	if (node.type === 'comment' || node.type === 'doctype' || node.type === 'raw') return '';
	return (node.children ?? []).map(headingText).join('');
}

/** Assigns an id to every h1-h6 in the tree so anchors resolve in server-rendered HTML. */
export function assignHeadingIds(tree: HastNode): HastNode {
	const slug = createSlugger();

	const walk = (node: HastNode) => {
		if (node.type === 'element' && HEADINGS.has(node.tagName)) {
			node.properties = { ...node.properties, id: slug(headingText(node)) };
		}
		if ('children' in node && Array.isArray(node.children)) {
			for (const child of node.children) walk(child as HastNode);
		}
	};

	walk(tree);
	return tree;
}

export function rehypeVpHeadingIds() {
	return (tree: HastNode) => assignHeadingIds(tree);
}
