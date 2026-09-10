<script lang="ts">
	import AccountElement from '$lib/components/elements/account.svelte';

	const { authorization } = $props();
</script>

{#if authorization}
	<AccountElement name={authorization[0].actor} />
	provided the network resources for this transaction.
{:else}
	The network resources for this transaction were provided by a 3rd party.
{/if}
