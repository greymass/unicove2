<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import { TextInput } from '@wharfkit/svelte-components';
	import Struct from '$lib/components/contract/struct.svelte';

	let filter = $state('');
	const { data } = $props();

	let filteredStructs = $derived.by(() => {
		if (!filter) return data.abi.structs;
		return data.abi.structs.filter((struct) => String(struct.name).includes(filter));
	});
</script>

<Stack>
	<p>The data structures defined by this contract.</p>
	<TextInput bind:value={filter} autofocus placeholder="Filter structs..." />
	<ul class="grid grid-cols-[auto_1fr] gap-4 overflow-x-auto">
		{#each filteredStructs as struct}
			<Struct abi={data.abi} contract={data.contract} {struct} />
		{:else}
			{#if filter}
				<p>No actions match filter</p>
			{:else}
				<p>No actions</p>
			{/if}
		{/each}
	</ul>
</Stack>
