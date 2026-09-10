<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	const { children }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table>
		{@render children?.()}
	</table>
</div>
