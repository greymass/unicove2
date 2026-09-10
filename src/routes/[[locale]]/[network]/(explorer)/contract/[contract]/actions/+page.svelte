<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import { TextInput } from '@wharfkit/svelte-components';
	import Action from '$lib/components/contract/action.svelte';

	let filter = $state('');
	const { data } = $props();

	let filteredActions = $derived.by(() => {
		if (!filter) return data.abi.actions;
		return data.abi.actions.filter((action) => String(action.name).includes(filter));
	});
</script>

<Stack>
	<p>The actions for this contract with their input parameters and potential response data.</p>
	<TextInput bind:value={filter} autofocus placeholder="Filter actions..." />
	<ul class="grid grid-cols-[auto_1fr] gap-x-4 overflow-x-auto">
		{#each filteredActions as action}
			<Action abi={data.abi} contract={data.contract} {action} />
		{:else}
			{#if filter}
				<p>No actions match filter</p>
			{:else}
				<p>No actions</p>
			{/if}
		{/each}
	</ul>
</Stack>
