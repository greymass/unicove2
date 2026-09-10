<script lang="ts">
	import { Card } from '@wharfkit/svelte-components';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();
</script>

<Card class={cn('animate-pulse', className)}>
	<div class="space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div class="min-w-0 flex-1 space-y-2">
				<div class="bg-surface-container h-6 w-3/4 rounded"></div>
				<div class="bg-surface-container h-4 w-1/2 rounded"></div>
			</div>
		</div>

		<div class="space-y-4">
			<div class="bg-surface-container h-2 overflow-hidden rounded-full">
				<div class="bg-surface-container-high h-full w-2/3"></div>
			</div>

			<div class="flex items-center justify-between">
				<div class="bg-surface-container h-4 w-16 rounded"></div>
				<div class="bg-surface-container h-4 w-20 rounded"></div>
			</div>
		</div>
	</div>
</Card>
