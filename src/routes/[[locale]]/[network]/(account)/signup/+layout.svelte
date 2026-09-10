<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';

	const { children } = $props();
</script>

<Stack tag="article" class="gap-6">
	<div class="relative">
		<Stack
			class="before:bg-surface-container gap-6 *:z-10 before:absolute before:-inset-4 before:z-0 md:mx-auto md:max-w-md md:p-6 md:pb-10 md:before:inset-0 md:before:rounded-2xl"
		>
			{@render children?.()}
		</Stack>
	</div>
</Stack>
