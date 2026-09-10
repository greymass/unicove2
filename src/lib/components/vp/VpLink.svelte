<script lang="ts">
	import { getContext } from 'svelte';
	import { rewriteVpHref } from '$lib/vp/links';

	interface Props {
		href?: string;
		children?: import('svelte').Snippet;
	}

	const { href = '', children }: Props = $props();
	const ctx = getContext<{ slug: string; basePath: string; branch: string }>('vp-links');
	const link = $derived(rewriteVpHref(href, ctx));
</script>

{#if link.kind === 'plain'}
	<span>{@render children?.()}</span>
{:else if link.kind === 'external'}
	<a href={link.href} rel="noopener noreferrer" target="_blank">{@render children?.()}</a>
{:else}
	<a href={link.href}>{@render children?.()}</a>
{/if}
