<script>
	import { Card } from '@wharfkit/svelte-components';

	const props = $props();
</script>

<Card class="relative">
	<header>
		<p class="text-muted my-0">{props.pair}</p>
		<div class="flex justify-between">
			<div>
				<div class="bg-surface-container mt-1 h-4 w-32 animate-pulse rounded-full"></div>
				<div class="bg-surface-container mt-1 h-4 w-16 animate-pulse rounded-full"></div>
			</div>
			<div class="bg-surface-container mt-1 h-4 w-16 animate-pulse rounded-full"></div>
		</div>
	</header>

	<div class="grid h-32 place-items-center">
		<svg
			class="text-muted size-8 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	</div>

	<hr class="bg-outline h-px border-0" />

	<div class="flex items-center justify-between font-medium">
		<div class="bg-surface-container mt-1 h-4 w-16 animate-pulse rounded-full"></div>
		<div class="bg-surface-container mt-1 h-4 w-16 animate-pulse rounded-full"></div>
	</div>
</Card>
