<script lang="ts">
	import { type ComponentProps, type Snippet } from 'svelte';
	import type { TextInput } from '@wharfkit/svelte-components';

	import { defaultRegistry } from '$lib/state/search';
	import type { SearchRecord } from '$lib/state/search';
	import { cn } from '$lib/utils';

	interface ResultProps extends ComponentProps<typeof TextInput> {
		record: SearchRecord;
		onclick: (event: MouseEvent) => void;
		active?: boolean;
		children?: Snippet;
	}

	let { record, onclick, active, children, ...props }: ResultProps = $props();

	// Get the plugin for this record type to access UI configuration
	const plugin = $derived(defaultRegistry.getResultPlugin(record.type));

	// Determine icon to display
	const Icon = $derived(plugin?.ui.icon);

	// Format the value using plugin's formatter or default
	const displayValue = $derived.by(() => {
		if (plugin?.ui.formatValue) {
			return plugin.ui.formatValue(record);
		}
		return record.value;
	});

	// Format the description using plugin's formatter or default
	const displayDescription = $derived.by(() => {
		if (plugin?.ui.formatDescription) {
			return plugin.ui.formatDescription(record);
		}
		if (record.description) {
			return record.description;
		}
		return `View ${record.type}`;
	});

	// Determine if value should be truncated
	const shouldTruncate = $derived(plugin?.ui.truncate);
	const truncateClass = $derived.by(() => {
		if (!shouldTruncate) return '';
		if (shouldTruncate === 'center') return '';
		if (typeof shouldTruncate === 'number') return `max-w-[${shouldTruncate}ch] truncate`;
		return 'truncate';
	});
</script>

<a
	data-active={active}
	class={cn(
		'focus-visible:ring-solar-500 grid grid-cols-subgrid items-center rounded-lg select-none focus-visible:ring-3 focus-visible:outline-hidden focus-visible:ring-inset sm:col-span-2',
		props.class
	)}
	href={record.url}
	{onclick}
>
	<div class="ml-2 flex items-center gap-2 font-mono text-nowrap tabular-nums">
		{#if Icon}
			<Icon class="size-4" />
		{/if}
		<span class={truncateClass}>
			{displayValue}
		</span>
	</div>

	<span
		data-active={active}
		class="align-center truncate pr-2 text-right text-base font-medium text-nowrap text-inherit capitalize sm:block sm:pr-0 sm:text-left"
	>
		{displayDescription}
	</span>

	{@render children?.()}
</a>
