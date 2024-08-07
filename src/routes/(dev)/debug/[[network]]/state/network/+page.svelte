<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import { page } from '$app/stores';
	import { chainMapper } from '$lib/wharf/chains';
	import Pillgroup from '$lib/components/navigation/pillgroup.svelte';
	import { Stack } from '$lib/components/layout';

	const { data } = $props();
	const { network } = $derived(data);

	const shortName = $derived(chainMapper.toShortName(String(network?.chain.id)));
	const apiPath = $derived(`${$page.url.protocol}//${$page.url.host}/${shortName}/api/network`);
</script>

<Stack>
	<header class="flex flex-wrap items-end items-end justify-between gap-6 pb-10">
		<Stack>
			<h2 class="h2">Network State</h2>
			<p>The currently loaded network state, based off the page URL you're on.</p>
		</Stack>
		<Pillgroup
			options={[
				{ active: shortName === 'eos', href: '/debug/state/network', text: 'Default (EOS)' },
				{ active: shortName === 'jungle4', href: '/debug/jungle4/state/network', text: 'Jungle4' },
				{ active: shortName === 'telos', href: '/debug/telos/state/network', text: 'Telos' }
			]}
		/>
	</header>
	<table>
		<tbody>
			<tr>
				<td>URL</td>
				<td>{$page.url}</td>
			</tr>
			<tr>
				<td>API</td>
				<td>
					<a href={apiPath} target="_blank">{apiPath}</a>
				</td>
			</tr>
			<tr>
				<td>Network</td>
				<td>{network?.chain.name}</td>
			</tr>
			<tr>
				<td>Last Updated</td>
				<td>{network?.last_update}</td>
			</tr>
		</tbody>
	</table>

	<Button class="self-start" onclick={() => network.refresh()}>Update network state</Button>
	<Code>
		{JSON.stringify(network, null, 2)}
	</Code>
</Stack>
