<script lang="ts">
	import { getContext } from 'svelte';

	import { Button } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<Stack class="items-start">
	<h2 class="text-headline">Wharf State</h2>
	<p>The state internal to the wharf service.</p>
	<h2 class="text-headline">controls</h2>
	<Button onclick={() => context.wharf.login()} variant="secondary">Login</Button>
	{#if context.wharf.session}
		<Button onclick={() => context.wharf.logout(context.wharf.session)} variant="secondary">
			Logout ({context.wharf.session.actor})
		</Button>
	{/if}
	{#if context.wharf.chainsSession}
		<Code>{JSON.stringify(context.wharf.chainsSession, null, 2)}</Code>
	{/if}
	{#if context.wharf.sessions.length}
		<Button onclick={() => context.wharf.logout()} variant="secondary">Logout (All Accounts)</Button
		>
	{/if}
	<h2 class="text-headline">session</h2>
	<p>The currently active session.</p>
	{#if context.wharf.session}
		<table>
			<tbody>
				<tr>
					<td>Account</td>
					<td>{String(context.wharf.session.permissionLevel)}</td>
				</tr>
				<tr>
					<td>Chain</td>
					<td>{String(context.wharf.session.chain.id)}</td>
				</tr>
			</tbody>
		</table>
	{:else}
		No Session Active
	{/if}
	<h2 class="text-headline">sessions</h2>
	<p>The available sessions that can be used.</p>
	{#each context.wharf.sessions as session}
		<p>
			<Button onclick={() => context.wharf.switch(session)} variant="secondary">
				Switch: {session.actor}@{session.permission} ({session.chain})
			</Button>
		</p>
	{/each}
</Stack>
