<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getAccount } from '$lib/state/client/account.svelte';
	import { getWharf } from '$lib/state/client/wharf.svelte';

	const wharf = getWharf();
	const account = getAccount();
</script>

{#if wharf.session}
	<h1>RAM: {wharf.session.actor}</h1>
{/if}

{#if account}
	<pre>{JSON.stringify(account.sources, null, 2)}</pre>
{/if}
