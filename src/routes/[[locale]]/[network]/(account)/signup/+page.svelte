<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, Stack } from '@wharfkit/svelte-components';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	let creating = $state(false);
	let failed = $state(false);

	async function createAccount() {
		creating = true;
		failed = false;
		try {
			await context.wharf.login({
				chain: context.network.chain.id,
				walletPlugin: 'anchor',
				arbitrary: { anchor: { mode: 'web' } }
			});
			goto(context.urlPath('/welcome'));
		} catch (error) {
			console.error('Account creation login failed:', error);
			creating = false;
			failed = true;
		}
	}
</script>

<Stack class="gap-2">
	<h3 class="text-title">Create your account</h3>
	<p>
		Account creation runs through Anchor, a secure authenticator that opens in a popup window.
		Choose a sign-in method there, and you'll return here with your new account ready to use.
	</p>
</Stack>

<Stack class="gap-4">
	<Button variant="primary" onclick={createAccount} disabled={creating}>
		{#if creating}
			Waiting for Anchor...
		{:else}
			Create account
		{/if}
	</Button>

	{#if failed}
		<p class="text-error text-sm" role="alert">
			Anchor did not finish creating your account. If you never saw the Anchor window, allow popups
			for this site and try again.
		</p>
	{/if}

	<p class="text-muted text-sm">
		Prefer to use your own wallet?
		<a class="text-primary" href={context.urlPath('/signup/wallets')}>Browse compatible wallets</a>
	</p>
</Stack>
