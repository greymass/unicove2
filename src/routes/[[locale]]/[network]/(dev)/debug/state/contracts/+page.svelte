<script lang="ts">
	import { Code } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { DefaultContracts } from '$lib/wharf/chains';

	const context = getContext<UnicoveContext>('state');

	const info = $derived.by(() => {
		return Object.keys(context.network.contracts).map((contractName: string) => {
			const contract = context.network.contracts[contractName as keyof DefaultContracts];
			return {
				name: contractName,
				account: contract.account
			};
		});
	});
</script>

<Stack>
	<h2 class="text-headline">Embedded Contracts</h2>
	<p>The wharfkit/cli generated contracts for this build and the on-chain account it uses.</p>
	<Code>
		{JSON.stringify(info, null, 2)}
	</Code>
</Stack>
