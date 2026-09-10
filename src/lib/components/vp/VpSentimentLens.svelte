<script lang="ts">
	import type { VpLens } from '$lib/vp/sentiment';

	interface Props {
		selected: VpLens;
		onselect: (lens: VpLens) => void;
	}

	const { selected, onselect }: Props = $props();

	const lenses: { lens: VpLens; label: string }[] = [
		{ lens: 'system', label: 'A' },
		{ lens: 'ram', label: 'RAM' },
		{ lens: 'vote', label: 'V' },
		{ lens: 'accounts', label: 'Accounts' }
	];
</script>

<div class="flex flex-wrap items-center gap-3">
	<span class="text-muted text-label-sm">Measure by</span>
	<div class="border-outline inline-flex overflow-hidden rounded-lg border">
		{#each lenses as { lens, label } (lens)}
			<button
				type="button"
				class="px-3 py-1.5 text-sm"
				class:bg-surface-container-high={selected === lens}
				class:font-semibold={selected === lens}
				class:text-muted={selected !== lens}
				onclick={() => onselect(lens)}
			>
				{label}
			</button>
		{/each}
	</div>
</div>
