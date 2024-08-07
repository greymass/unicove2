<script lang="ts">
	import { createSelect, createSync, melt, type SelectOption } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import Check from 'lucide-svelte/icons/check';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';

	interface Props {
		options: SelectOption[];
		selected: SelectOption;
		id: string;
		onSelectedChange: ChangeFn<SelectOption | undefined>;
	}

	let { id, options, selected: _selected = $bindable(), onSelectedChange }: Props = $props();

	const {
		elements: { trigger, menu, option },
		states: { open, selected, selectedLabel },
		helpers: { isSelected }
	} = createSelect({
		defaultSelected: _selected || options[0],
		onSelectedChange,
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});

	const sync = createSync({ selected });
	$effect(() => {
		sync.selected(_selected, (v) => (_selected = v || options[0]));
	});
</script>

<button
	class="flex h-10 items-center justify-between gap-2 rounded-full border-2 border-mineShaft-600 bg-transparent px-3 py-2 font-medium transition-opacity hover:opacity-90"
	use:melt={$trigger}
	aria-label="{id}-label"
	{id}
>
	{$selectedLabel || 'Select an option'}
	<ChevronDown class="size-5 transition-transform duration-100 {$open ? 'rotate-180' : ''}" />
</button>

{#if $open}
	<div
		class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-2xl border-2 border-mineShaft-600 bg-shark-950 px-1 py-1.5 shadow focus:!ring-0"
		use:melt={$menu}
		transition:fade={{ duration: 100 }}
	>
		{#each options as item}
			<div
				class="relative grid cursor-pointer grid-cols-[16px_1fr] items-center gap-2
						rounded-xl
				px-2
						py-1 font-medium
						hover:bg-solar-100 focus:z-10
						focus:text-solar-700 data-[highlighted]:bg-solar-200
						data-[highlighted]:text-solar-950
						data-[disabled]:opacity-50"
				use:melt={$option(item)}
			>
				<div class="check">
					<Check class="size-4 {$isSelected(item.value) ? 'block' : 'hidden'}" />
				</div>
				{item.label}
			</div>
		{/each}
	</div>
{/if}
