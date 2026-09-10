<script lang="ts">
	import type { NameType } from '@wharfkit/antelope';
	import { getContext, type Snippet } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { cn } from '$lib/utils';

	const { urlPath } = getContext<UnicoveContext>('state');

	interface Props {
		name: NameType;
		action?: NameType;
		struct?: NameType;
		table?: NameType;
		children?: Snippet;
		class?: string;
	}

	let { name, action, struct, table, children, ...props }: Props = $props();

	let path = $derived.by(() => {
		const base = `/contract/${name}`;
		if (action) {
			return base + `/actions/${action}`;
		}
		if (struct) {
			return base + `/structs/${struct}`;
		}
		if (table) {
			return base + `/tables/${table}`;
		}
		return base;
	});

	const href = $derived(urlPath(path));
</script>

{#if name}
	<a class={cn('text-primary hover:text-primary-hover', props.class)} {href}>
		{#if children}
			{@render children()}
		{:else}
			{name}
		{/if}
	</a>
{/if}
