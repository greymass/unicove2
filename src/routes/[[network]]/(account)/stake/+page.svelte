<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getWharf } from '$lib/state/client/wharf.svelte';

	const wharf = getWharf();
</script>

{#if wharf.session}
	<h1>Stake: {wharf.session.actor}</h1>
{/if}

{#if wharf.account}
	<pre>{JSON.stringify(wharf.account.data, null, 2)}</pre>
{/if}
