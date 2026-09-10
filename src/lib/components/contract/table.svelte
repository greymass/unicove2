<script lang="ts">
	import { getContext } from 'svelte';
	import { Name, type ABI } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import { Code, Table, TD, TH, TR } from '@wharfkit/svelte-components';

	import Database from '@lucide/svelte/icons/database';
	import Contract from '../elements/contract.svelte';
	import { parseRootType } from '$lib/utils/abi';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		abi: ABI;
		contract: Name;
		table: ABI.Table;
	}
	let { abi, contract, table }: Props = $props();

	const tableRow = $derived.by(() => {
		return abi.structs.find((s) => s.name === table.type);
	});
</script>

<li class="relative col-span-full grid grid-cols-subgrid">
	<div
		class="bg-surface-container col-span-full space-y-1 rounded-t-lg px-4 py-3 md:col-span-1 md:rounded-l-lg"
	>
		<div class="flex items-center">
			<Database class="mr-2" />
			<Contract name={contract} table={table.name} class="text-3xl font-bold">
				{table.name}
			</Contract>
		</div>

		{#if tableRow}
			<p>
				rows of
				<Contract name={contract} struct={tableRow.name}>
					{tableRow.name}
				</Contract>
			</p>
		{/if}
	</div>

	<div class="bg-surface-container rounded-b-lg px-4 py-3 md:rounded-r-lg">
		{#if tableRow}
			<Table full fixed>
				{#snippet thead()}
					<TH>Field</TH>
					<TH>Type</TH>
				{/snippet}

				{#each tableRow.fields as field}
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
						<TD class="text-muted" colspan="2">No data in response.</TD>
					</TR>
				{/each}
			</Table>

			{#if context.settings.data.debugMode}
				<Code>{JSON.stringify(tableRow.fields, null, 2)}</Code>
			{/if}
		{/if}
	</div>
</li>
