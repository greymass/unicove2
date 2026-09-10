<script lang="ts">
	import { getContext } from 'svelte';
	import { Name, type ABI } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import ContractActionOverview from '$lib/components/contract/action/overview.svelte';
	import ContractActionParams from '$lib/components/contract/action/params.svelte';
	import ContractActionResponse from '$lib/components/contract/action/response.svelte';
	import { Code } from '@wharfkit/svelte-components';
	import { Switcher } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		abi: ABI;
		action: ABI.Action;
		contract: Name;
	}
	let { abi, action, contract }: Props = $props();

	const struct = $derived(abi.structs.find((s) => s.name === action.type));
	const actionResult = $derived(abi.action_results.find((s) => s.name === action.name));
</script>

<li
	class="border-b-outline/50 relative col-span-full space-y-4 border-b py-12 first:pt-4 last:border-none"
>
	<div class="contract-action-overview col-span-full space-y-1">
		<ContractActionOverview {action} {contract} />
	</div>

	<Switcher class="items-start gap-6">
		<Stack>
			{#if struct}
				<ContractActionParams {abi} {contract} {struct} />
			{/if}
			{#if context.settings.data.debugMode}
				<Code>{JSON.stringify(struct, null, 2)}</Code>
			{/if}
		</Stack>

		<Stack>
			{#if actionResult}
				<ContractActionResponse {abi} {contract} {actionResult} />
			{/if}
			{#if context.settings.data.debugMode}
				<Code>{JSON.stringify(actionResult, null, 2)}</Code>
			{/if}
		</Stack>
	</Switcher>
</li>
