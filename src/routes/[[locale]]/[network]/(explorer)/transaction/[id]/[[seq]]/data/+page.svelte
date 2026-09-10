<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
</script>

<div class="p-2">
	<h2 class="text-headline text-2xl">Data</h2>
	<p>The raw data for the transaction.</p>
</div>

<Code>{JSON.stringify(data.transaction, null, 2)}</Code>
