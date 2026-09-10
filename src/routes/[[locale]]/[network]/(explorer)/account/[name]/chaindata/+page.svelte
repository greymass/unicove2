<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';

	const { data } = $props();
</script>

<Code>{JSON.stringify(data.account, null, 2)}</Code>
