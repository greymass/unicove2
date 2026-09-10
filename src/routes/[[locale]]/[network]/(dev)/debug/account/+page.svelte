<script lang="ts">
	import { Button } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { Chains } from '@wharfkit/common';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	let { data } = $props();

	function login() {
		context.wharf.login({
			chain: Chains.Jungle4,
			walletPlugin: 'wallet-plugin-privatekey',
			permissionLevel: 'wharfkit1133@active'
		});
	}
</script>

<div class="mt-8">
	{#if data.network.chain.id.equals(Chains.Jungle4.id)}
		<Button onclick={login}>Login</Button>
	{/if}
</div>
