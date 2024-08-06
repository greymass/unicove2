<script lang="ts">
	import { createSwitch, melt, createSync } from '@melt-ui/svelte';

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
	} = createSwitch({
		disabled: isDisabled,
		defaultChecked: isChecked
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
		relative
		h-5
		rounded-full
		border
		border-mineShaft-700
		bg-transparent
		focus-visible:border-solar-500
		focus-visible:outline
		focus-visible:outline-2
		focus-visible:outline-offset-[-2px]
		focus-visible:outline-solar-500
		disabled:bg-mineShaft-700
		data-[state=checked]:border-skyBlue-500
		data-[state=checked]:bg-skyBlue-500
		data-[state=checked]:hover:border-skyBlue-400
		data-[state=checked]:hover:bg-skyBlue-400
"
		{id}
		aria-labelledby={ariaLabelledBy}
	>
		<span class="thumb block rounded-full bg-neutral-400 transition"></span>
	</button>
	<input use:melt={$input} {name} />
</div>

<style>
	button {
		/* Width of the track */
		--w: 36px;
		width: var(--w);
	}

	.thumb {
		/* Size of the thumb */
		--size: 16px;
		width: var(--size);
		height: var(--size);
		transform: translateX(1px);
	}

	:global([data-state='checked']) .thumb {
		transform: translateX(calc(var(--w) - (var(--size) + 3px)));
		background-color: white;
	}

	:global(button[data-disabled='true']) .thumb {
		background-color: white;
	}
</style>
