<script lang="ts">
	import { createCheckbox, melt, createSync } from '@melt-ui/svelte';
	import Check from '$lib/components/input/icons/check.svelte';

	interface Props {
		isDisabled?: boolean;
		isChecked?: boolean;
		name: string;
		id: string;
	}

	let {
		isDisabled = false,
		isChecked = $bindable(false),
		name,
		id = 'default-switch-id'
	}: Props = $props();

	const {
		elements: { root, input },
		states
	} = createCheckbox({
		defaultChecked: isChecked,
		disabled: isDisabled,
	});

	const sync = createSync(states);
	$effect(() => {
		sync.checked(isChecked, (v) => (isChecked = v));
	});

	const ariaLabelledBy = `${id}-label`;
</script>

<form>
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
			text-magnum-600
			disabled:bg-gray-700
			data-[state=checked]:bg-sky-500
			data-[state=checked]:border-sky-500
			data-[state=checked]:hover:bg-sky-400
			data-[state=checked]:hover:border-sky-400
			data-[state=checked]:disabled:bg-gray-700
			data-[state=checked]:disabled:border-gray-700
			focus-visible:outline
			focus-visible:outline-offset-2
			focus-visible:outline-transparent
			focus-visible:border-solar-500
			focus-visible:ring
			focus-visible:ring-solar-500
			focus-visible:ring-offset-solar-500
			"
			{id}
			aria-labelledby={ariaLabelledBy}
		>
			{#if isChecked}
				<Check class="size-5" />
			{/if}
			<input use:melt={$input} />
		</button>
		<label class="pl-4 font-medium text-magnum-900" for={id}>
			Accept terms and conditions.
		</label>
		<input use:melt={$input} {name} />
	</div>
</form>