<script lang="ts">
	import { getContext } from 'svelte';
	import { Code } from '@wharfkit/svelte-components';

	interface Props {
		children?: import('svelte').Snippet;
	}

	const { children }: Props = $props();
	const block = getContext<boolean>('vp-code-block') ?? false;
</script>

<Code inline={!block} collapsible={block}>
	{@render children?.()}
</Code>
