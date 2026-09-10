<script lang="ts">
	import type { ABI, Name } from '@wharfkit/antelope';
	import Braces from '@lucide/svelte/icons/brackets';
	import Brackets from '@lucide/svelte/icons/brackets';

	import Contract from '$lib/components/elements/contract.svelte';
	import { parseRootType } from '$lib/utils/abi';
	import { Table, TD, TH, TR } from '@wharfkit/svelte-components';

	interface Props {
		abi: ABI;
		actionResult: ABI.ActionResult;
		contract: Name;
	}
	let { abi, actionResult, contract }: Props = $props();

	const response: ABI.Field[] = $derived.by(() => {
		if (actionResult) {
			const resultStruct = abi.structs.find((s) => s.name === actionResult.result_type);
			if (resultStruct) {
				return resultStruct.fields;
			}
			const resultArray = abi.structs.find(
				(s) => s.name === parseRootType(actionResult.result_type)
			);
			if (resultArray) {
				return [
					{
						name: '...',
						type: actionResult.result_type
					}
				];
			}
			return [
				{
					name: String(actionResult.name),
					type: actionResult.result_type
				}
			];
		}
		return [];
	});

	const arrayResponse = $derived.by(() => {
		return response.length && response[0].type.endsWith('[]');
	});
</script>

<Table>
	{#snippet thead()}
		<TH colspan="2" class="text-lg font-bold">
			{#if arrayResponse}
				Response Array
				<Brackets class="ml-2 inline" />
			{:else}
				Response Object
				<Braces class="ml-2 inline" />
			{/if}
		</TH>
	{/snippet}

	{#each response as field}
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
