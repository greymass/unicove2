<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Checksum256Type } from '@wharfkit/antelope';
	import { cn, truncateCenter } from '$lib/utils';
	import { getContext, type Snippet } from 'svelte';

	const { urlPath } = getContext<UnicoveContext>('state');

	let {
		id,
		class: className,
		children
	}: { id: Checksum256Type; class?: string; children?: Snippet } = $props();

	const truncatedString = truncateCenter(String(id));
</script>

{#if id}
	<a
		class={cn('text-primary hover:text-primary-hover', className)}
		href={urlPath(`/transaction/${String(id)}`)}
	>
		{#if children}
			{@render children()}
		{:else}
			{truncatedString}
		{/if}
	</a>
{/if}
