<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { getAccount } from '$lib/state/client/account.svelte';
	import { Stack } from '$lib/components/layout';

	const account = getAccount();
</script>

<Stack>
	<h2 class="h2">Account State</h2>
	<p>The account state for the currently active session.</p>
	{#if account.name}
		<Button class="self-start" onclick={() => account.refresh()}>Update account state</Button>
		<table>
			<tbody>
				<tr>
					<td>Balances (light_api)</td>
					<td>{account.balances.length}</td>
				</tr>
				<tr>
					<td>Delegations (delband)</td>
					<td>{account.delegations.length}</td>
				</tr>
				<!-- <tr>
					<td>REX Data</td>
					<td>{account.rex}</td>
				</tr> -->
			</tbody>
		</table>
		<Code>
			{JSON.stringify(account, null, 2)}
		</Code>
	{:else}
		<p>No account state available.</p>
	{/if}
</Stack>
