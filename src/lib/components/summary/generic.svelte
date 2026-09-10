<script lang="ts">
	import GenericSummary from './generic.svelte';

	interface Props {
		data: Record<string, unknown>;
		nested?: boolean;
	}

	let { data, nested = false }: Props = $props();

	const sortedEntries = $derived(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
</script>

{#if nested}
	<div class="border-outline-variant/30 ml-2 border-l pl-2">
		{#each sortedEntries as [key, value]}
			<div class="flex flex-wrap gap-x-2 gap-y-0.5 py-0.5">
				<span class="text-on-surface-variant shrink-0 text-xs">{key}:</span>
				<span class="min-w-0 font-mono text-xs break-all">
					{#if typeof value === 'object' && value !== null}
						<GenericSummary data={value as Record<string, unknown>} nested />
					{:else}
						{String(value)}
					{/if}
				</span>
			</div>
		{/each}
	</div>
{:else}
	<div class="flex flex-wrap gap-x-4 gap-y-1">
		{#each sortedEntries as [key, value]}
			<div class="flex gap-1.5">
				<span class="text-on-surface-variant shrink-0 text-xs">{key}:</span>
				<span class="min-w-0 font-mono text-xs break-all">
					{#if typeof value === 'object' && value !== null}
						<GenericSummary data={value as Record<string, unknown>} nested />
					{:else}
						{String(value)}
					{/if}
				</span>
			</div>
		{/each}
	</div>
{/if}
