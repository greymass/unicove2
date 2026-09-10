<script lang="ts">
	import { Button } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		text: string;
		children?: Snippet;
		button?: { text: string; href: string };
		class?: string;
	}
	let props: Props = $props();
</script>

<Stack class={cn('max-w-md items-start', props.class)}>
	<h2 class="text-title leading-tight">{props.title}</h2>
	<p>{props.text}</p>
	{#if props.button && props.button.href}
		<Button class="-ml-3" variant="text" href={props.button.href}>
			{props.button.text}
		</Button>
	{/if}
	{@render props.children?.()}
</Stack>
