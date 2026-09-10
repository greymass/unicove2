<script lang="ts">
	import { Select, type ExtendedSelectOption } from '@wharfkit/svelte-components';

	interface StatusFilterProps {
		value: string;
		onchange: (status: string) => void;
	}

	const { value, onchange }: StatusFilterProps = $props();

	const statusOptions: ExtendedSelectOption[] = [
		{ label: 'All Statuses', value: 'all' },
		{ label: 'Proposed', value: 'proposed' },
		{ label: 'Executed', value: 'executed' },
		{ label: 'Cancelled', value: 'cancelled' },
		{ label: 'Expired', value: 'expired' }
	];

	const selected: ExtendedSelectOption = $derived(
		statusOptions.find((o) => o.value === value) || statusOptions[0]
	);

	function handleChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next && next.value !== value) {
			onchange(String(next.value));
		}
		return next;
	}
</script>

<Select
	id="status-filter"
	triggerClass="text-nowrap"
	options={statusOptions}
	{selected}
	onSelectedChange={handleChange}
/>
