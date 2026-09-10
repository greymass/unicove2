<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { VpSummary } from '$lib/vp/types';

	interface Props {
		summary: VpSummary;
		current: string;
	}

	const { summary, current }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const languages = $derived(['en', ...summary.translations.map((t) => t.lang)]);
	const displayName = (lang: string) =>
		new Intl.DisplayNames([lang], { type: 'language' }).of(lang) || lang;
</script>

{#if languages.length > 1}
	<nav class="flex flex-wrap gap-2" aria-label="Document language">
		{#each languages as lang (lang)}
			<button
				type="button"
				class="rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors {lang ===
				current
					? 'border-primary text-primary'
					: 'border-outline-variant text-muted hover:border-outline hover:text-on-surface'}"
				aria-current={lang === current ? 'true' : undefined}
				onclick={() => (context.settings.data.locale = lang)}
			>
				{displayName(lang)}
			</button>
		{/each}
	</nav>
{/if}
