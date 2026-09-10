<script lang="ts">
	import { SingleCard } from '$lib/components/layout';

	let { children } = $props();
</script>

<SingleCard>
	{@render children?.()}
</SingleCard>
