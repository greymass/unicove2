<script lang="ts">
	import { page } from '$app/state';
	import { SingleCard } from '$lib/components/layout';
	import { Stack } from '@wharfkit/svelte-components';
	// import Generic404 from '$lib/components/errors/generic.svelte';
</script>

<!-- This error page gets triggered if any of the routes in the sibling directories fail -->
<!-- Here we can switch on the error message and determine which error component to render -->
<!-- e.g. {#if $page.error?.code === 'ACCOUNT_NOT_FOUND'} -->

<SingleCard>
	<Stack class="py-8 text-center">
		<div class="*:object-fit *:size-full">
			<!-- <Generic404 /> -->
		</div>
		<h1 class="text-headline">
			{#if page.error?.message}
				{page.error.message}
			{:else}
				Page not found
			{/if}
		</h1>
		<!-- {#if debugMode} -->
		<!-- <Code>{JSON.stringify($page.error, null, 2)}</Code> -->
		<!-- {/if} -->
	</Stack>
</SingleCard>
