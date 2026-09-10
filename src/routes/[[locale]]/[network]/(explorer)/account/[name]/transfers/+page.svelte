<script lang="ts">
	import TransfersView from './TransfersView.svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';

	let { data } = $props();
</script>

{#if data.network.supports('robo2')}
	<TransfersView {data} />
{:else}
	<Stack class="py-4">
		<Card class="p-8 text-center">
			<p class="text-on-surface-variant">
				Token transfers view requires Robo2 history support, which is not available on this network.
			</p>
		</Card>
	</Stack>
{/if}
