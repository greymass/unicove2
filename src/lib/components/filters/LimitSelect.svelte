<script lang="ts">
	import { Select, type ExtendedSelectOption } from '@wharfkit/svelte-components';

	interface Props {
		value: number;
		onChange: (value: number) => void;
	}

	const { value, onChange }: Props = $props();

	const limitOptions: ExtendedSelectOption[] = [
		{ label: '10', value: 10 },
		{ label: '20', value: 20 },
		{ label: '50', value: 50 }
	];

	const selected = $derived(limitOptions.find((o) => o.value === value) || limitOptions[1]);

	function handleChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next && next.value !== value) {
			onChange(next.value as number);
		}
		return next;
	}
</script>

<Select id="limit-filter" options={limitOptions} {selected} onSelectedChange={handleChange} />
