<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import ActionElement from '$lib/components/elements/action.svelte';

	const context = getContext<UnicoveContext>('state');

	let { data } = $props();
</script>

<div class="p-2">
	<h2 class="text-headline text-2xl">Actions ({data.transaction.transaction.actions.length})</h2>
	<p>The actions performed in the transaction, without the inline actions.</p>
</div>

<SelectActionVariant />

{#each data.transaction.transaction.actions as action}
	{@const contract = String(action.account)}
	{@const name = String(action.name)}
	{@const summary = getActionSummaryComponent(contract, name)}
	{#await context.network.objectifyAction(action) then objectified}
		<ActionElement {action} {objectified} variant="pretty" {summary} />
	{:catch}
		<ActionElement {action} variant="pretty" />
	{/await}
{/each}
