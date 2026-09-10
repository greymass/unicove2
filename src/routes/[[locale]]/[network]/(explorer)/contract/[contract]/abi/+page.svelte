<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';

	const { data } = $props();
</script>

<Stack>
	<Code>{JSON.stringify(data.abi, null, 2)}</Code>
</Stack>
