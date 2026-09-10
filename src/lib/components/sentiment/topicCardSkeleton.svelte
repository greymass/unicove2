<script lang="ts">
	import { Card, Stack } from '@wharfkit/svelte-components';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();
</script>

<Card class={cn('animate-pulse', className)}>
	<Stack>
		<header class="flex items-start justify-between gap-4">
			<div class="flex-1 space-y-2 text-left">
				<div class="bg-surface-container h-6 w-3/4 rounded"></div>
				<div class="bg-surface-container h-4 w-1/4 rounded"></div>
			</div>
			<div class="space-y-2 text-right">
				<div class="bg-surface-container ml-auto h-5 w-20 rounded"></div>
				<div class="bg-surface-container ml-auto h-4 w-16 rounded"></div>
			</div>
		</header>

		<div class="bg-surface-container h-2 overflow-hidden rounded-full">
			<div class="bg-surface-container-high h-full w-1/2"></div>
		</div>
	</Stack>
</Card>
