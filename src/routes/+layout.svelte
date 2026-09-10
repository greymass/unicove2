<script lang="ts">
	import '../app.css';
	import '$lib/utils/dayjs'; // setup dayjs
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';

	import Toaster from '$lib/components/toast/toaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	{#if PUBLIC_ENVIRONMENT !== 'production'}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<Toaster />

{@render children?.()}
