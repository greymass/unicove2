<script lang="ts">
	import { setContext } from 'svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	const { children }: Props = $props();

	setContext('vp-code-block', true);
</script>

{@render children?.()}
