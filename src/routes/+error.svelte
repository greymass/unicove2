<script lang="ts">
	import { page } from '$app/state';
	import { Stack } from '@wharfkit/svelte-components';
	import Generic404 from '$lib/components/errors/generic.svelte';
	import { Button } from '@wharfkit/svelte-components';
</script>

<svelte:head>
	<!-- @wc-ignore -->
	<script>
		(function () {
			if (typeof window !== undefined) {
				const storedTheme = localStorage.getItem('color-scheme');
				const theme =
					storedTheme ||
					(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
				document.documentElement.setAttribute('data-scheme', theme);
				if (!storedTheme) localStorage.setItem('color-scheme', theme);
			}
		})();
	</script>
</svelte:head>

<div class="mx-auto max-w-prose">
	<Stack class="py-8 text-center">
		<div class=" *:object-fit mx-auto max-w-prose *:size-full">
			<Generic404 />
		</div>
		<h1 class="text-headline">
			{#if page.error?.message}
				{page.error.message}
			{:else}
				Page not found
			{/if}
		</h1>

		<!-- @wc-ignore -->
		<Button class="mx-auto max-w-fit" variant="primary" data-sveltekit-reload href="/">
			Go to Unicove
		</Button>
	</Stack>
</div>
