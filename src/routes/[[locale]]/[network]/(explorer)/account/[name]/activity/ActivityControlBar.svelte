<script lang="ts">
	import { getContext } from 'svelte';
	import { GridIcon, ListIcon, TableIcon } from '@lucide/svelte';

	import type { ActionDisplayVariants } from '$lib/types.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import type { Snippet } from 'svelte';

	interface Props {
		controls?: Snippet;
		filterPanel?: Snippet;
		controlBarEl?: HTMLElement;
	}

	let { controls, filterPanel, controlBarEl = $bindable() }: Props = $props();

	const context = getContext<UnicoveContext>('state');

	let variant: ActionDisplayVariants = $derived(
		(context.settings.data.actionDisplayVariant as ActionDisplayVariants) || 'table'
	);

	function setVariant(v: ActionDisplayVariants) {
		context.settings.data.actionDisplayVariant = v;
	}
</script>

<div
	bind:this={controlBarEl}
	class="bg-surface-container-low border-outline-variant flex flex-col gap-3 rounded-xl border p-3"
>
	<div class="flex flex-wrap items-center gap-3">
		<div class="border-outline-variant flex items-center rounded-lg border">
			<button
				onclick={() => setVariant('summary')}
				class="flex items-center gap-1.5 rounded-l-lg px-3 py-2 text-sm font-medium transition-colors {variant ===
				'summary'
					? 'bg-primary text-on-primary'
					: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
				title="Summary view"
			>
				<ListIcon size={16} />
				<span class="hidden md:inline">Summary</span>
			</button>
			<button
				onclick={() => setVariant('table')}
				class="border-outline-variant flex items-center gap-1.5 border-x px-3 py-2 text-sm font-medium transition-colors {variant ===
				'table'
					? 'bg-primary text-on-primary'
					: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
				title="Table view"
			>
				<TableIcon size={16} />
				<span class="hidden md:inline">Table</span>
			</button>
			<button
				onclick={() => setVariant('pretty')}
				class="flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors {variant ===
				'pretty'
					? 'bg-primary text-on-primary'
					: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
				title="Action Data view"
			>
				<GridIcon size={16} />
				<span class="hidden md:inline">Data</span>
			</button>
		</div>

		{#if controls}
			{@render controls()}
		{/if}
	</div>

	{#if filterPanel}
		{@render filterPanel()}
	{/if}
</div>
