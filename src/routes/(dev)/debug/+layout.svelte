<script lang="ts">
	let { children } = $props();
	import { PageMargin } from '$lib/components/layout';
</script>

<PageMargin>
	{@render children()}
</PageMargin>
