<script lang="ts">
	import { Button } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { page } from '$app/stores';
	import { Stack } from '@wharfkit/svelte-components';

	const { data } = $props();
	const { network } = $derived(data);

	const shortName = $derived(network.config.short);
	const apiPath = $derived(`${$page.url.protocol}//${$page.url.host}/${shortName}/api/network`);
</script>

<Stack>
	<header class="flex flex-wrap items-end items-end justify-between gap-6 pb-10">
		<Stack>
			<h2 class="text-headline">Network State</h2>
			<p>The currently loaded network state, based off the page URL you're on.</p>
		</Stack>
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
				<td>{network?.connection.updated}</td>
			</tr>
		</tbody>
	</table>

	<Button class="self-start" onclick={() => network.refresh()}>Update network state</Button>
	<Code>{JSON.stringify(network, null, 2)}</Code>
</Stack>
