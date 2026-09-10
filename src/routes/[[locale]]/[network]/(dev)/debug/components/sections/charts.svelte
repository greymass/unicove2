<script>
	import { Stack } from '@wharfkit/svelte-components';
	import BarChart from '$lib/components/chart/barchart.svelte';
</script>

<Stack id="charts">
	<h2 class="text-headline">Charts</h2>
	<h3 class="text-title">Bar Chart</h3>
	<BarChart data={[]} title="Staking Yield History" />
</Stack>
