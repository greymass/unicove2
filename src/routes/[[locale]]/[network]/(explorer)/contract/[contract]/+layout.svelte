<script lang="ts">
	import { Contract } from '@wharfkit/contract';
	import { getContext, setContext } from 'svelte';

	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	const { children, data } = $props();

	const { urlPath } = getContext<UnicoveContext>('state');

	setContext(
		'contract',
		new Contract({
			abi: data.abi,
			account: data.contract,
			client: data.network.client
		})
	);

	const options = $derived.by(() => {
		const account = String(data.contract);
		return [
			{ href: urlPath(`/contract/${account}`), text: 'Overview' },
			{
				href: urlPath(`/contract/${account}/actions`),
				text: `Actions (${data.abi.actions.length})`
			},
			{
				href: urlPath(`/contract/${account}/structs`),
				text: `Structs (${data.abi.structs.length})`
			},
			{
				href: urlPath(`/contract/${account}/tables`),
				text: `Tables (${data.abi.tables.length})`
			},
			{ href: urlPath(`/contract/${account}/abi`), text: 'ABI' }
		];
	});
</script>

<PillGroup {options} />

{@render children?.()}
