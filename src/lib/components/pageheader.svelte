<script lang="ts">
	import { goto } from '$app/navigation';
	import { IconButton, CopyButton } from '@wharfkit/svelte-components';
	import Tooltip from '$lib/components/tooltip/tooltip.svelte';
	import { type NetworkState } from '$lib/state/network.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { getContext, type ComponentProps, type Component } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	interface Badge {
		icon: Component;
		tooltip?: string;
		class?: string;
	}

	interface Props {
		title: string;
		subtitle?: string;
		backPath?: string;
		network: NetworkState;
		copyData?: string;
		actions?: ComponentProps<typeof IconButton>[];
		badges?: Badge[];
	}

	let props: Props = $props();

	const { urlPath } = getContext<UnicoveContext>('state');

	function goBack() {
		if (props.backPath) {
			goto(urlPath(props.backPath));
		} else {
			history.back();
		}
	}

	let logo = $derived(props.network.config.logo || '');
</script>

<header class="col-span-full flex min-h-15 items-start gap-3 sm:gap-4 md:pr-(--shell-ctl)">
	{#if props.backPath}
		<IconButton
			size="large"
			variant="filled"
			class="text-primary shrink-0 self-center"
			onclick={goBack}
			icon={ChevronLeft}
		/>
	{:else}
		<picture class="mt-2 size-8 shrink-0 sm:size-12">
			<img
				src={String(logo)}
				alt={String(props.network.chain.name)}
				class="size-full object-contain"
			/>
		</picture>
	{/if}

	<div class="grid gap-0">
		<div class="text-primary relative flex min-h-6 w-fit items-center gap-2 sm:min-h-10">
			<h1 class="text-title text-on-surface sm:text-headline leading-none font-bold">
				{props.title}
			</h1>

			{#if props.badges}
				{#each props.badges as badge}
					{#if badge.tooltip}
						<Tooltip content={badge.tooltip} icon={undefined}>
							<badge.icon class={badge.class ?? 'text-primary size-6'} />
						</Tooltip>
					{:else}
						<badge.icon class={badge.class ?? 'text-primary size-6'} />
					{/if}
				{/each}
			{/if}

			{#if props.copyData}
				<CopyButton
					class="absolute right-0 translate-x-full"
					data={props.copyData}
					hideBackground
				/>
			{/if}

			{#if props.actions}
				{#each props.actions as action}
					<IconButton icon={action.icon} href={action.href} hideBackground />
				{/each}
			{/if}
		</div>

		<p class="text-muted text-label-sm leading-5 text-pretty sm:text-base">
			{props.subtitle || ''}
		</p>
	</div>
</header>
