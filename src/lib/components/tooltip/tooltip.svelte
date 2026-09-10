<script lang="ts">
	import { createTooltip, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { type Snippet } from 'svelte';
	import { type Icon } from '@lucide/svelte';

	interface Props {
		content: string;
		children?: Snippet;
		icon?: typeof Icon;
		fadeDuration?: number;
		openDelay?: number;
		closeDelay?: number;
	}

	const {
		content,
		children,
		icon,
		fadeDuration = 50,
		openDelay = 300,
		closeDelay = 300
	}: Props = $props();

	const {
		elements: { trigger, content: tooltipContent },
		states: { open }
	} = createTooltip({
		openDelay,
		closeDelay
	});
</script>

<span use:melt={$trigger}>
	{#if children}
		{@render children()}
	{/if}
</span>

{#if $open}
	<div
		use:melt={$tooltipContent}
		transition:fade={{ duration: fadeDuration }}
		class="border-outline bg-surface-container text-on-surface z-50 flex max-w-xs items-center rounded-md border px-4 py-3 text-sm shadow-md"
	>
		{#if icon}
			{@const IconComponent = icon}

			<span class="mr-3">
				<IconComponent size={18} />
			</span>
		{/if}
		<span>{content}</span>
	</div>
{/if}
