<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { buildNavModel } from '$lib/components/navigation/model.svelte';

	const context = getContext<UnicoveContext>('state');
	const model = $derived(buildNavModel(context, context.network));
</script>

<Stack>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each model.tools as tool (tool.text)}
			<a href={tool.href} class="card hover:bg-surface-container-high transition-colors">
				<span class="text-title">{tool.text}</span>
				<span class="text-on-surface-variant text-sm">{tool.description}</span>
			</a>
		{/each}
	</div>
</Stack>
