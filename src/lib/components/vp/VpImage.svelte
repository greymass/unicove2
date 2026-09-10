<script lang="ts">
	import { getContext } from 'svelte';
	import { resolveVpImageSrc } from '$lib/vp/links';

	interface Props {
		src?: string;
		alt?: string;
	}

	const { src = '', alt = '' }: Props = $props();
	const ctx = getContext<{ slug: string; basePath: string; branch: string }>('vp-links');
	const resolved = $derived(resolveVpImageSrc(src, ctx));
</script>

{#if resolved}
	<img src={resolved} {alt} loading="lazy" class="my-4 max-w-full rounded-xl bg-white p-4" />
{:else}
	<span>{alt}</span>
{/if}
