<script lang="ts">
	import { createSelect, melt, type CreateSelectProps } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { locales } from 'virtual:wuchale/locales';
	import { writable } from 'svelte/store';
	import { cn } from '$lib/utils/style';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	const displayName = (loc: string) =>
		new Intl.DisplayNames([loc], { type: 'language' }).of(loc) || 'Unknown';

	const context = getContext<UnicoveContext>('state');
	const handleSelect: CreateSelectProps<string>['onSelectedChange'] = ({ next }) => {
		if (next?.value) {
			context.settings.data.locale = next.value;
		}
		return next;
	};

	// melt-ui doesn't seem to like runes, so setting up a writable and effect
	const selectedLang = writable({
		value: context.settings.data.locale,
		label: displayName(context.settings.data.locale)
	});

	$effect(() => {
		selectedLang.set({
			value: context.settings.data.locale,
			label: displayName(context.settings.data.locale)
		});
	});

	const {
		elements: { trigger, menu, option },
		states: { open }
	} = createSelect<string>({
		defaultSelected: $selectedLang,
		preventScroll: false,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		onSelectedChange: handleSelect
	});
</script>

<button
	class={cn(
		'border-outline focus:border-primary flex h-10 items-center justify-between gap-2 rounded-full border-2 bg-transparent py-2 pr-3 pl-4 font-medium transition-opacity hover:opacity-90 focus:outline-none',
		className
	)}
	use:melt={$trigger}
	aria-label="langauge-select-label"
	id="language-select"
>
	{displayName(context.settings.data.locale)}
	<ChevronDown class="size-5 transition-transform duration-100 {$open ? 'rotate-180' : ''}" />
</button>

{#if $open}
	<ul
		data-theme={context.network}
		class="border-outline bg-surface-container z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-2xl border-2 px-1 py-1 shadow-sm focus:ring-0!"
		use:melt={$menu}
		in:fade={{ duration: 100 }}
	>
		{#each locales as lang}
			<li
				aria-current={lang === context.settings.data.locale ? 'page' : undefined}
				class=" hover:bg-primary hover:text-on-primary focus:text-on-primary data-highlighted:bg-primary data-highlighted:text-on-primary relative cursor-pointer rounded-xl px-2 py-1 font-medium focus:z-10 data-disabled:opacity-50"
				use:melt={$option({ value: lang, label: displayName(lang) })}
			>
				{displayName(lang)}
			</li>
		{/each}
	</ul>
{/if}
