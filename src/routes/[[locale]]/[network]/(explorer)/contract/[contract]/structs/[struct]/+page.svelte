<script lang="ts">
	import type { ABI } from '@wharfkit/antelope';

	import Struct from '$lib/components/contract/struct.svelte';

	const { data } = $props();
	const struct = data.abi.structs.find((s: ABI.Struct) => s.name === data.struct);
</script>

{#if struct}
	<ul class="grid grid-cols-[auto_1fr] gap-4 overflow-x-auto">
		<Struct abi={data.abi} contract={data.contract} {struct} />
	</ul>
{/if}
