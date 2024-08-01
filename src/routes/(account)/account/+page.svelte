<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { wharf } from '$lib/wharf/service.svelte';
	import Code from '$lib/components/code.svelte';
</script>

{#if wharf.account}
	<Code>{JSON.stringify(wharf.account.data, null, 2)}</Code>
{/if}
