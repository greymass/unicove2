<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Chip } from '@wharfkit/svelte-components';
	import { shortLabel, type TargetDescriptor } from '$lib/discussion/targets';

	interface Props {
		descriptors: TargetDescriptor[];
		class?: string;
	}

	const { descriptors, class: className = '' }: Props = $props();

	const activeKey = $derived(page.url.searchParams.get('target'));

	function select(descriptor: TargetDescriptor | null) {
		const url = new URL(page.url);
		if (descriptor) url.searchParams.set('target', descriptor.key);
		else url.searchParams.delete('target');
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<div class="flex flex-wrap gap-2 {className}" role="group" aria-label="Filter comments by target">
	<button
		onclick={() => select(null)}
		class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center"
		aria-current={activeKey === null ? 'true' : undefined}
	>
		<Chip class="px-3 py-1.5 text-sm {activeKey === null ? 'bg-primary text-on-primary' : ''}"
			>All</Chip
		>
	</button>
	{#each descriptors as d (d.key)}
		<button
			onclick={() => select(d)}
			class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center"
			aria-current={activeKey === d.key ? 'true' : undefined}
		>
			<Chip class="px-3 py-1.5 text-sm {activeKey === d.key ? 'bg-primary text-on-primary' : ''}"
				>{shortLabel(d)}</Chip
			>
		</button>
	{/each}
</div>
