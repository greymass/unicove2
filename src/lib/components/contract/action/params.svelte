<script lang="ts">
	import type { ABI, Name } from '@wharfkit/antelope';
	import Braces from '@lucide/svelte/icons/braces';

	import Contract from '$lib/components/elements/contract.svelte';
	import { parseRootType } from '$lib/utils/abi';
	import { Table, TD, TH, TR } from '@wharfkit/svelte-components';

	interface Props {
		abi: ABI;
		contract: Name;
		struct: ABI.Struct;
	}
	let { abi, contract, struct }: Props = $props();
</script>

{#if struct}
	<Table>
		{#snippet thead()}
			<TH colspan="2" class="text-lg font-bold">
				Request Parameters
				<Braces class="ml-2 inline" />
			</TH>
		{/snippet}

		{#each struct.fields as field}
			{@const fieldType = abi.structs.find((s) => s.name === parseRootType(field.type))}
			<TR>
				<TD>
					<span class="text-on-surface">
						{field.name}
					</span>
				</TD>
				<TD>
					{#if fieldType}
						<Contract name={contract} struct={fieldType.name}>
							{field.type}
						</Contract>
					{:else}
						{field.type}
					{/if}
				</TD>
			</TR>
		{:else}
			<TR>
				<TD class="text-muted" colspan="2">No action parameters.</TD>
			</TR>
		{/each}
	</Table>
{/if}
