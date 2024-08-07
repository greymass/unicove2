<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';
	import { getAccount } from '$lib/state/client/account.svelte.js';

	const account = getAccount();
</script>

{#if account}
	<Code>{JSON.stringify(account, null, 2)}</Code>
{/if}
