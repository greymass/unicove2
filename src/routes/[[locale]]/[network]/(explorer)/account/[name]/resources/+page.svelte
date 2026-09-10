<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';

	const { data } = $props();
</script>

<div class="space-y-4">
	<h3 class="text-title">RAM Prices</h3>
	<Code>{JSON.stringify(data.network.resources.ram.price.rammarket, null, 2)}</Code>

	{#if data.account}
		<h3 class="text-title">RAM</h3>
		<Code>{JSON.stringify(data.account.resources.ram, null, 2)}</Code>
		<h3 class="text-title">CPU</h3>
		<Code>{JSON.stringify(data.account.resources.cpu, null, 2)}</Code>
		<h3 class="text-title">NET</h3>
		<Code>{JSON.stringify(data.account.resources.net, null, 2)}</Code>
	{/if}
</div>
