<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}
	let { title, children }: Props = $props();
</script>

<section class="mt-8 grid gap-3" aria-label={title}>
	<h2 class="text-title">{title}</h2>
	<div class="text-muted grid max-w-prose gap-3 text-pretty">
		{@render children()}
	</div>
</section>
