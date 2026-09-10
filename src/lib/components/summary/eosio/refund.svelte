<script lang="ts">
	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.refund;
	}

	const { data }: Props = $props();
</script>

System contract refund request for {data.owner}.
