<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Card, cn } from '@wharfkit/svelte-components';

	interface Props {
		label: string;
		children: Snippet;
		class?: string;
	}

	const props: Props = $props();
</script>

<Card class={cn('bg-surface-container grid items-center gap-2 text-center', props.class)}>
	<h3 class="text-label-sm text-muted">{props.label}</h3>
	<p class="text-display text-on-surface">
		{@render props.children()}
	</p>
</Card>
