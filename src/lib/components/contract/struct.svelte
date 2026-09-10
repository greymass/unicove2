<script lang="ts">
	import { Name, type ABI } from '@wharfkit/antelope';
	import SquareDashedBottomCode from '@lucide/svelte/icons/square-dashed-bottom';

	import { Code } from '@wharfkit/svelte-components';

	import Contract from '../elements/contract.svelte';
	import { parseRootType } from '$lib/utils/abi';

	interface Props {
		abi: ABI;
		struct: ABI.Struct;
		contract: Name;
	}
	let { abi, struct, contract }: Props = $props();

	const usedAsFieldInStruct: ABI.Struct[] = $derived.by(() => {
		return abi.structs.filter((s) =>
			s.fields.some((f) => {
				return parseRootType(f.type) === struct.name;
			})
		);
	});

	const usedAsParamInAction: ABI.Action[] = $derived.by(() => {
		return abi.actions.filter((a) => {
			return a.type === struct.name;
		});
	});

	const usedAsTypeInTable: ABI.Table[] = $derived.by(() => {
		return abi.tables.filter((t) => {
			return t.type === struct.name;
		});
	});

	const usedAsReturnTypeInAction: ABI.ActionResult[] = $derived.by(() => {
		return abi.action_results.filter((a) => {
			return parseRootType(a.result_type) === struct.name;
		});
	});

	const usedAsBaseTypeForStruct: ABI.Struct[] = $derived.by(() => {
		return abi.structs.filter((a) => {
			return a.base === struct.name;
		});
	});

	const usedStructForBaseType: ABI.Struct[] = $derived.by(() => {
		return abi.structs.filter((s) => {
			return struct.base === s.name;
		});
	});
</script>

<li class=" relative col-span-full grid grid-cols-subgrid">
	<div
		class="bg-surface-container col-span-full space-y-1 rounded-t-lg px-4 py-3 md:col-span-1 md:rounded-l-lg"
	>
		<div class="flex items-center">
			<SquareDashedBottomCode class="mr-2" />
			<Contract name={contract} struct={struct.name} class="text-3xl font-bold">
				{struct.name}
			</Contract>
		</div>

		{#each usedStructForBaseType as struct}
			<p>
				Extends base type of
				<Contract name={contract} struct={struct.name}>
					{struct.name}
				</Contract>
			</p>
		{/each}

		{#each usedAsBaseTypeForStruct as struct}
			<p>
				Struct base type of
				<Contract name={contract} struct={struct.name}>
					{struct.name}
				</Contract>
			</p>
		{/each}

		{#each usedAsParamInAction as action}
			<p>
				Action parameter in
				<Contract name={contract} action={action.name}>
					{action.name}
				</Contract>
			</p>
		{/each}

		{#each usedAsFieldInStruct as struct}
			<p>
				Struct property of
				<Contract name={contract} struct={struct.name}>
					{struct.name}
				</Contract>
			</p>
		{/each}

		{#each usedAsTypeInTable as table}
			<p>
				Table row type of
				<Contract name={contract} table={table.name}>
					{table.name}
				</Contract>
			</p>
		{/each}

		{#each usedAsReturnTypeInAction as action}
			<p>
				Action return type for
				<Contract name={contract} action={action.name}>
					{action.name}
				</Contract>
			</p>
		{/each}
	</div>

	<div class="bg-surface-container rounded-b-lg px-4 py-3 md:rounded-r-lg">
		<Code>{JSON.stringify(struct, null, 2)}</Code>
	</div>
</li>
