<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { copyByLocale, harness, type LocaleKey } from './copy';
	import VariantA from './variant-a.svelte';
	import VariantB from './variant-b.svelte';
	import VariantC from './variant-c.svelte';

	const context = getContext<UnicoveContext>('state');

	type VariantKey = 'a' | 'b' | 'c';
	type Phase = 'idle' | 'creating' | 'failed';

	let variant = $state<VariantKey>((page.url.searchParams.get('variant') as VariantKey) || 'a');
	let locale = $state<LocaleKey>('en');
	let width = $state<'wide' | 'narrow'>('wide');
	let phase = $state<Phase>('idle');
	let allOpen = $state(false);
	let live = $state(false);

	let copy = $derived(copyByLocale[locale]);
	let walletsHref = $derived(context.urlPath('/signup/wallets'));

	function pickVariant(key: VariantKey) {
		variant = key;
		const url = new URL(page.url);
		url.searchParams.set('variant', key);
		replaceState(url, page.state);
	}

	async function create() {
		if (!live) {
			phase = phase === 'creating' ? 'failed' : 'creating';
			return;
		}
		phase = 'creating';
		try {
			await context.wharf.login({
				chain: context.network.chain.id,
				walletPlugin: 'anchor',
				arbitrary: { anchor: { mode: 'web' } }
			});
			phase = 'idle';
		} catch {
			phase = 'failed';
		}
	}
</script>

<div class="grid gap-6">
	<header class="grid gap-1">
		<h2 class="text-headline">{harness.title}</h2>
		<p class="text-muted text-sm">{harness.subtitle}</p>
	</header>

	<div
		class="bg-surface-container border-outline sticky top-2 z-20 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border p-3 text-sm"
	>
		{#snippet group(
			label: string,
			options: readonly { key: string; label: string }[],
			selected: string,
			onpick: (key: string) => void
		)}
			<div class="flex items-center gap-2">
				<span class="text-muted text-xs tracking-wider uppercase">{label}</span>
				<div class="border-outline flex overflow-hidden rounded-lg border">
					{#each options as option (option.key)}
						<button
							type="button"
							onclick={() => onpick(option.key)}
							data-active={selected === option.key}
							class="data-[active=true]:bg-primary data-[active=true]:text-on-primary hover:bg-surface-container-high px-3 py-1.5 transition-colors"
						>
							{option.label}
						</button>
					{/each}
				</div>
			</div>
		{/snippet}

		{@render group(harness.variant, harness.variants, variant, (k) => pickVariant(k as VariantKey))}
		{@render group(harness.locale, harness.locales, locale, (k) => (locale = k as LocaleKey))}
		{@render group(harness.width, harness.widths, width, (k) => (width = k as 'wide' | 'narrow'))}
		{@render group(harness.phase, harness.phases, phase, (k) => (phase = k as Phase))}

		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={allOpen} />
			{harness.allOpen}
		</label>

		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={live} />
			{harness.live}
		</label>
	</div>

	<div class="grid justify-items-center">
		<div
			class="border-outline w-full overflow-hidden rounded-2xl border"
			style:max-width={width === 'narrow' ? '390px' : 'none'}
		>
			<div class="@container grid min-h-[640px]">
				{#if variant === 'a'}
					<VariantA {copy} {allOpen} {phase} {walletsHref} oncreate={create} />
				{:else if variant === 'b'}
					<VariantB {copy} {allOpen} {phase} {walletsHref} oncreate={create} />
				{:else}
					<VariantC {copy} {allOpen} {phase} {walletsHref} oncreate={create} />
				{/if}
			</div>
		</div>
	</div>
</div>
