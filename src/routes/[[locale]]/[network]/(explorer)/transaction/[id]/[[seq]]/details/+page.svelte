<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import TransactionHeader from '$lib/components/transaction/header.svelte';

	const { data } = $props();
</script>

<Stack class="gap-8">
	<div class="space-y-2">
		<h2 class="text-title">Transaction Details</h2>
		<TransactionHeader transaction={data.transaction} />
	</div>
</Stack>
