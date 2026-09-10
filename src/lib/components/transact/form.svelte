<script lang="ts">
	import type { Checksum256 } from '@wharfkit/session';
	import type { Snippet } from 'svelte';

	import TransactError from '$lib/components/transact/error.svelte';
	import TransactSummary from '$lib/components/transact/summary.svelte';

	interface TransactFormProps {
		children: Snippet;
		id?: Checksum256;
		onsuccess?: () => ReturnType<import('svelte').Snippet>;
		error?: string;
		onfailure?: () => ReturnType<import('svelte').Snippet>;
	}

	let { error, id, onfailure, onsuccess, ...props }: TransactFormProps = $props();
</script>

{#if error}
	<TransactError {error} {onfailure} />
{:else if id && onsuccess}
	<TransactSummary transactionId={id} {onsuccess} />
{:else}
	{@render props.children()}
{/if}
