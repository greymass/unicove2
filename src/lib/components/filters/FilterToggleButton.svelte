<script lang="ts">
	import { FilterIcon, ChevronDownIcon } from '@lucide/svelte';
	import { Chip } from '@wharfkit/svelte-components';

	interface Props {
		isOpen: boolean;
		activeCount?: number;
		onToggle: () => void;
	}

	const { isOpen, activeCount = 0, onToggle }: Props = $props();
</script>

<button
	onclick={onToggle}
	class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
>
	<FilterIcon size={16} />
	<span class="hidden sm:inline">Filters</span>
	{#if activeCount > 0}
		<Chip class="bg-primary text-on-primary h-5 min-w-5 px-1.5 text-xs font-semibold">
			{activeCount}
		</Chip>
	{/if}
	<ChevronDownIcon
		size={16}
		class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
	/>
</button>
