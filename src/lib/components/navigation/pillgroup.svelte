<script lang="ts">
	import { Button } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { createSelect, melt, type CreateSelectProps } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { ChevronDown } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	interface Option {
		href: string;
		text: string;
	}

	interface Props {
		options: Option[];
		class?: string;
	}

	const { options, ...props }: Props = $props();

	let currentOption = $derived(
		options.map((o) => o.href).findLast((h) => page.url.pathname.startsWith(h))
	);

	let currentLabel = $derived(
		options.find((o) => o.href === currentOption)?.text ?? options[0].text
	);

	const isCurrent = (href: string) => currentOption === href;

	const handleSelect: CreateSelectProps<string>['onSelectedChange'] = ({ next }) => {
		if (next) {
			goto(next.value);
		}

		return next;
	};

	const {
		elements: { trigger, menu, option },
		states: { open }
	} = createSelect<string>({
		forceVisible: true,
		preventScroll: false,
		onSelectedChange: handleSelect,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});
</script>

<menu aria-label="page functions" class={cn('hidden gap-2 overflow-auto lg:flex', props.class)}>
	{#each options as option}
		<li>
			<Button
				variant="pill"
				class="h-11"
				aria-current={isCurrent(option.href) ? 'page' : undefined}
				href={option.href}
			>
				{option.text}
			</Button>
		</li>
	{/each}
</menu>

<div
	class="border-outline focus-visible:border-solar-500 flex flex-col rounded-lg border-2 bg-transparent lg:hidden"
>
	<button
		class="text-on-surface focus-visible:outline-solar-500 flex h-12 items-center justify-between rounded-[inherit] px-4 text-base font-medium focus-visible:outline"
		use:melt={$trigger}
		aria-label="Page"
	>
		{currentLabel}
		<ChevronDown
			data-open={$open}
			class="size-5 transition-transform duration-100 data-[open=true]:rotate-180"
		/>
	</button>

	{#if $open}
		<menu
			class="border-outline bg-surface z-50 flex max-h-[300px] flex-col overflow-y-auto rounded-lg border py-2 shadow-sm focus:ring-0!"
			use:melt={$menu}
			transition:fade={{ duration: 100 }}
		>
			{#each options as { href, text }}
				<li
					class="text-muted data-selected:text-on-surface data-highlighted:text-primary h-12 grow content-center px-4"
					use:melt={$option({ value: href, label: text })}
					aria-current={isCurrent(href) ? 'page' : undefined}
				>
					{text}
				</li>
			{/each}
		</menu>
	{/if}
</div>
