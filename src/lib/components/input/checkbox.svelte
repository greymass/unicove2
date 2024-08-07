<script lang="ts">
	import { createCheckbox, melt, createSync } from '@melt-ui/svelte';
	import Check from '$lib/components/input/icons/check.svelte';
	import Label from '$lib/components/input/label.svelte';

	interface Props {
		isDisabled: boolean;
		isChecked: boolean | 'indeterminate';
		name: string;
		id: string;
	}

	let {
		isDisabled = false,
		isChecked = $bindable(false),
		name,
		id
	}: Props = $props();

	const {
		elements: { root, input },
		states
	} = createCheckbox({
		defaultChecked: isChecked,
		disabled: isDisabled
	});

	const sync = createSync(states);
	$effect(() => {
		sync.checked(isChecked, (v) => (isChecked = v));
	});

	const ariaLabelledBy = `${id}-label`;
</script>

<div class="flex items-center">
	<button
		use:melt={$root}
		class="
			flex
			size-5
			appearance-none
			border-solid
			border
			border-gray-700
			items-center
			justify-center
			rounded
			bg-transparent
			focus-visible:border-solar-500
			focus-visible:outline
			focus-visible:outline-2
			focus-visible:outline-offset-[-2px]
			focus-visible:outline-solar-500
			disabled:bg-mineShaft-950
			disabled:border-mineShaft-950
			data-[state=checked]:border-skyBlue-500
			data-[state=checked]:bg-skyBlue-500
			data-[state=checked]:hover:border-skyBlue-400
			data-[state=checked]:hover:bg-skyBlue-400
			data-[state=checked]:disabled:bg-mineShaft-950
			data-[state=checked]:disabled:border-mineShaft-950
			"
		{id}
		aria-labelledby={ariaLabelledBy}
	>
		{#if isChecked}
			<Check />
		{/if}
		<input use:melt={$input} />
	</button>
	<Label for={id}>
		Accept terms and conditions.
	</Label>
	<input use:melt={$input} {name} />
</div>