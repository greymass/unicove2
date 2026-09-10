<script lang="ts">
	import * as DelphiContract from '$lib/wharf/contracts/delphioracle';
	import { Chip } from '@wharfkit/svelte-components';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: DelphiContract.Types.write;
	}

	const { data }: Props = $props();
</script>

<div class="space-y-2">
	{#each data.quotes as quote}
		<div class="flex gap-2">
			<Chip>{quote.pair}</Chip>
			{quote.value}
		</div>
	{/each}
</div>
