<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';

	import ActivityV1 from './ActivityV1.svelte';
	import ActivityV2 from './ActivityV2.svelte';
	import ActivityControlBar from './ActivityControlBar.svelte';

	let { data } = $props();

	let fallbackToV1 = $state(false);

	const showV1 = $derived(!data.network.supports('robo2') || fallbackToV1);
</script>

{#if showV1}
	<Stack class="py-4">
		<ActivityControlBar />
		<ActivityV1 {data} />
	</Stack>
{:else}
	<ActivityV2 {data} onError={() => (fallbackToV1 = true)} />
{/if}
