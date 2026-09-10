<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';

	const props = $props();
</script>

{props.data.account.last_update}

<Code>
	{JSON.stringify(props.data.balance, null, 2)}
</Code>
