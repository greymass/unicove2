<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
</script>

<div class="p-2">
	<h2 class="text-headline text-2xl">Traces ({data.transaction.traces.length})</h2>
	<p>The individual transaction traces from the transaction.</p>
</div>

{#each data.transaction.traces as trace}
	<Code collapsible json={trace} />
{/each}
