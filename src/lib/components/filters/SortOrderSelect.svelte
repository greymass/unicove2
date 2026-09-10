<script lang="ts">
	import { Label, Select, type ExtendedSelectOption } from '@wharfkit/svelte-components';

	interface Props {
		value: 'asc' | 'desc';
		onChange: (value: 'asc' | 'desc') => void;
		showLabel?: boolean;
	}

	const { value, onChange, showLabel = true }: Props = $props();

	const orderOptions: ExtendedSelectOption[] = [
		{ label: 'Newest First', value: 'desc' },
		{ label: 'Oldest First', value: 'asc' }
	];

	const selected = $derived(orderOptions.find((o) => o.value === value) || orderOptions[0]);

	function handleChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next) {
			onChange(next.value as 'asc' | 'desc');
		}
		return next;
	}
</script>

{#if showLabel}
	<div class="flex flex-col gap-1.5">
		<Label for="order-input">Sort Order</Label>
		<Select id="order-input" options={orderOptions} {selected} onSelectedChange={handleChange} />
	</div>
{:else}
	<Select id="order-input" options={orderOptions} {selected} onSelectedChange={handleChange} />
{/if}
