<script lang="ts">
	import { Select, type ExtendedSelectOption } from '@wharfkit/svelte-components';

	interface ActionTypeFilterProps {
		value: string;
		onchange: (actionType: string) => void;
	}

	const { value, onchange }: ActionTypeFilterProps = $props();

	const actionTypeOptions: ExtendedSelectOption[] = [
		{ label: 'All Actions', value: 'all' },
		{ label: 'Proposed', value: 'proposed' },
		{ label: 'Approved', value: 'approved' },
		{ label: 'Unapproved', value: 'unapproved' },
		{ label: 'Executed', value: 'executed' },
		{ label: 'Cancelled', value: 'cancelled' }
	];

	let selected: ExtendedSelectOption = $state(
		actionTypeOptions.find((o) => o.value === value) || actionTypeOptions[0]
	);

	function handleChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next) {
			selected = next;
			onchange(String(next.value));
		}
		return next;
	}
</script>

<Select
	triggerClass="text-nowrap"
	id="action-type-filter"
	options={actionTypeOptions}
	bind:selected
	onSelectedChange={handleChange}
/>
