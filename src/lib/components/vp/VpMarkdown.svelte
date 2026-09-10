<script lang="ts">
	import { setContext } from 'svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import type { Plugin } from 'svelte-exmarkdown';
	import { TD, TH, TR } from '@wharfkit/svelte-components';
	import { rehypeVpHeadingIds } from '$lib/vp/headings';
	import { VP_BRANCH } from '$lib/vp/links';
	import VpLink from './VpLink.svelte';
	import VpImage from './VpImage.svelte';
	import VpHeading1 from './VpHeading1.svelte';
	import VpHeading2 from './VpHeading2.svelte';
	import VpHeading3 from './VpHeading3.svelte';
	import VpHeading4 from './VpHeading4.svelte';
	import VpHeading5 from './VpHeading5.svelte';
	import VpHeading6 from './VpHeading6.svelte';
	import VpTable from './VpTable.svelte';
	import VpPre from './VpPre.svelte';
	import VpCode from './VpCode.svelte';

	interface Props {
		body: string;
		slug: string;
		basePath: string;
		branch?: string;
	}

	const { body, slug, basePath, branch = VP_BRANCH }: Props = $props();

	// Getters keep the context tracking the props across client-side navigation between proposals.
	setContext('vp-links', {
		get slug() {
			return slug;
		},
		get basePath() {
			return basePath;
		},
		get branch() {
			return branch;
		}
	});

	const vpPlugin: Plugin = {
		rehypePlugin: rehypeVpHeadingIds,
		renderer: {
			a: VpLink,
			img: VpImage,
			table: VpTable,
			tr: TR,
			td: TD,
			th: TH,
			pre: VpPre,
			code: VpCode,
			h1: VpHeading1,
			h2: VpHeading2,
			h3: VpHeading3,
			h4: VpHeading4,
			h5: VpHeading5,
			h6: VpHeading6
		}
	};

	const plugins = [gfmPlugin(), vpPlugin];
</script>

<div class="vp-prose">
	<Markdown md={body} {plugins} />
</div>

<style>
	.vp-prose {
		line-height: 1.7;
	}
	.vp-prose > :global(:first-child) {
		margin-block-start: 0;
	}
	.vp-prose :global(p) {
		margin-block: 0.75rem;
		color: var(--color-on-surface);
	}
	.vp-prose :global(a) {
		color: var(--color-primary);
		text-decoration: underline;
		text-decoration-color: color-mix(in oklab, var(--color-primary) 50%, transparent);
		text-underline-offset: 0.2em;
		transition: text-decoration-color 120ms ease-out;
	}
	.vp-prose :global(a:hover) {
		text-decoration-color: var(--color-primary);
	}
	.vp-prose :global(blockquote p) {
		color: inherit;
	}
	.vp-prose :global(ul),
	.vp-prose :global(ol) {
		margin-block: 0.75rem;
		padding-inline-start: 1.5rem;
	}
	.vp-prose :global(ul) {
		list-style: disc;
	}
	.vp-prose :global(ol) {
		list-style: decimal;
	}
	.vp-prose :global(li) {
		margin-block: 0.375rem;
		color: var(--color-on-surface);
	}
	.vp-prose :global(table) {
		margin-block: 1rem;
	}
	.vp-prose :global(blockquote) {
		margin-block: 1rem;
		padding-inline-start: 1rem;
		border-inline-start: 3px solid var(--color-outline);
		color: var(--color-muted);
	}
	.vp-prose :global(hr) {
		margin-block: 2rem;
	}
	/* Long unbreakable tokens (hashes, account paths) must wrap instead of stretching the page. */
	.vp-prose :global(code) {
		overflow-wrap: anywhere;
	}
</style>
