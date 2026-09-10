<script lang="ts">
	interface Props {
		level: 1 | 2 | 3 | 4 | 5 | 6;
		id?: string;
		children?: import('svelte').Snippet;
	}

	const { level, id, children }: Props = $props();

	const styles: Record<number, string> = {
		1: 'text-headline mt-12 mb-4',
		2: 'text-headline-sm mt-10 mb-3',
		3: 'text-title mt-8 mb-2',
		4: 'text-base font-semibold mt-6 mb-2',
		5: 'text-sm font-semibold mt-4 mb-1',
		6: 'text-sm font-medium text-muted mt-4 mb-1'
	};
</script>

<svelte:element this={`h${level}`} {id} class="{styles[level] ?? styles[4]} scroll-mt-24">
	{@render children?.()}
</svelte:element>
