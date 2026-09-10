<script lang="ts">
	import { Switch } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	let debugMode = $state(!!context.settings.data.debugMode);

	$effect(() => {
		context.settings.data.debugMode = debugMode;
	});
</script>

<Switch id="debug-mode" bind:checked={debugMode} />
