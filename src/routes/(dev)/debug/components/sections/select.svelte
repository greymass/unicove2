<script>
	import { Cluster, Stack } from '$lib/components/layout';
	import Select from '$lib/components/select/select.svelte';
	import Label from '$lib/components/input/label.svelte';

	const options = [
		{ value: 30, label: '30d' },
		{ value: 60, label: '60d' },
		{ value: 90, label: '90d' },
		{ value: 365, label: '365d' }
	];
	let selected = $state(options[1]);
</script>

<Stack id="select">
	<h2 class="h2">Select</h2>

	<Stack class="items-start">
		<h3 class="h3">Basic Select</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="date-range">Select a date range</Label>
				<Select id="date-range" {options} bind:selected />
			</Stack>
			<span>Value in parent: {selected.label}</span>
		</Cluster>
	</Stack>
</Stack>
