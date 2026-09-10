<script lang="ts">
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';

	interface Props {
		hasPrev: boolean;
		hasNext: boolean;
		isLoading?: boolean;
		prevLabel?: string;
		onPrev: () => void;
		onNext: () => void;
	}

	const {
		hasPrev,
		hasNext,
		isLoading = false,
		prevLabel = 'Prev',
		onPrev,
		onNext
	}: Props = $props();
</script>

<div class="border-outline-variant flex items-center rounded-lg border">
	<button
		onclick={onPrev}
		disabled={!hasPrev || isLoading}
		class="flex items-center gap-1 rounded-l-lg px-2 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed {hasPrev &&
		!isLoading
			? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
			: 'text-on-surface-variant/40'}"
		title={prevLabel}
	>
		<ChevronLeftIcon size={16} />
		<span class="hidden sm:inline">{prevLabel}</span>
	</button>
	<span class="bg-outline-variant h-5 w-px"></span>
	<button
		onclick={onNext}
		disabled={!hasNext || isLoading}
		class="flex items-center gap-1 rounded-r-lg px-2 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed {hasNext &&
		!isLoading
			? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
			: 'text-on-surface-variant/40'}"
		title="Next page"
	>
		<span class="hidden sm:inline">Next</span>
		<ChevronRightIcon size={16} />
	</button>
</div>
