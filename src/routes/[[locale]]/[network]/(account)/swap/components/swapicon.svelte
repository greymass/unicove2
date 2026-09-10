<script lang="ts">
	import { ArrowLeftRight, MemoryStick, Package, Repeat } from '@lucide/svelte';
	import { cn } from '$lib/utils/style';

	import type { SwapKind } from '../describe.svelte';

	interface Props {
		kind: SwapKind;
		size?: 'small' | 'large';
		class?: string;
	}

	const { kind, size = 'small', class: className = '' }: Props = $props();

	const icons = {
		market: MemoryStick,
		wrap: Package,
		legacy: Repeat,
		other: ArrowLeftRight
	};

	const Icon = $derived(icons[kind]);
</script>

<span
	class={cn(
		'bg-surface-container-high text-muted grid shrink-0 place-items-center rounded-lg',
		size === 'large' ? 'size-12' : 'size-10',
		className
	)}
>
	<Icon size={size === 'large' ? 22 : 18} aria-hidden="true" />
</span>
