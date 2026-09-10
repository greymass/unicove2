<script lang="ts">
	import VpHeading from './VpHeading.svelte';

	interface Props {
		id?: string;
		children?: import('svelte').Snippet;
	}

	const { id, children }: Props = $props();
</script>

<VpHeading level={1} {id}>{@render children?.()}</VpHeading>
