<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { type UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const { children, data } = $props();

	const { settings, urlPath } = getContext<UnicoveContext>('state');

	let ramDeltas = $derived.by(() => {
		return data.transaction.traces.reduce((acc, trace) => {
			if (trace.account_ram_deltas.length) {
				acc += trace.account_ram_deltas.length;
			}
			return acc;
		}, 0);
	});

	const options = $derived.by(() => {
		let urlBase = urlPath(`/transaction/${data.id}`);
		if (data.seq) {
			urlBase += `/${data.seq}`;
		}
		const options = [
			{ href: urlBase, text: 'Summary' },
			{ href: `${urlBase}/details`, text: 'Details' },
			// { href: `${urlBase}/resources`, text: 'Resources' },
			{
				href: `${urlBase}/actions`,
				text: `Actions (${data.transaction.transaction.actions.length})`
			},
			{ href: `${urlBase}/transaction`, text: 'Transaction' }
		];
		options.push({
			href: `${urlBase}/traces`,
			text: `Traces (${data.transaction.traces.length})`
		});
		options.push({
			href: `${urlBase}/ram`,
			text: `RAM Usage (${ramDeltas})`
		});

		if (settings.data.developerMode) {
			options.push({ href: `${urlBase}/data`, text: 'Data' });
		}
		return options;
	});
</script>

<Stack class="@container gap-8">
	<PillGroup {options} />
	{@render children?.()}
</Stack>
