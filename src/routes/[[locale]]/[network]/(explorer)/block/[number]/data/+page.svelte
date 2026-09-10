<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
</script>

<Code>
	{JSON.stringify(data.block, null, 2)}
</Code>
