<script lang="ts">
	import { Label } from '@wharfkit/svelte-components';

	interface Props {
		startDate: string;
		endDate: string;
		onKeyPress?: (event: KeyboardEvent) => void;
	}

	let { startDate = $bindable(), endDate = $bindable(), onKeyPress }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	<Label for="start-date-input">From Date</Label>
	<input
		type="date"
		id="start-date-input"
		bind:value={startDate}
		onkeypress={onKeyPress}
		class="date-input bg-surface-container border-outline-variant focus:text-on-surface h-10 w-full rounded-lg border px-3 text-sm {startDate
			? 'has-value'
			: ''}"
	/>
</div>

<div class="flex flex-col gap-1.5">
	<Label for="end-date-input">To Date</Label>
	<input
		type="date"
		id="end-date-input"
		bind:value={endDate}
		onkeypress={onKeyPress}
		class="date-input bg-surface-container border-outline-variant focus:text-on-surface h-10 w-full rounded-lg border px-3 text-sm {endDate
			? 'has-value'
			: ''}"
	/>
</div>

<style>
	.date-input {
		color-scheme: dark;
	}

	.date-input::-webkit-datetime-edit {
		color: rgb(var(--color-on-surface-variant) / 0.7);
	}

	.date-input.has-value::-webkit-datetime-edit {
		color: rgb(var(--color-on-surface));
	}

	.date-input::-webkit-calendar-picker-indicator {
		filter: invert(0.7);
	}
</style>
