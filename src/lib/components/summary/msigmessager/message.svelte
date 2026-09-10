<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: { message: string };
	}

	const { data }: Props = $props();
	const { urlPath } = getContext<UnicoveContext>('state');

	let paragraphs = $derived(
		data.message
			.split(/\n\n+/)
			.map((p) => p.trim())
			.filter(Boolean)
	);

	// VP tokens link internally only; URLs in the memo stay plain text.
	function segments(paragraph: string) {
		return paragraph.split(/(\bVP-\d+\b)/).map((text) => ({
			text,
			vp: /^VP-\d+$/.test(text) ? text.toLowerCase() : undefined
		}));
	}
</script>

<div class="max-w-prose space-y-4 text-sm leading-7">
	{#each paragraphs as paragraph}
		<p class="break-words whitespace-pre-wrap">
			{#each segments(paragraph) as segment}{#if segment.vp}<a
						class="text-primary hover:underline"
						href={urlPath(`/proposals/${segment.vp}`)}>{segment.text}</a
					>{:else}{segment.text}{/if}{/each}
		</p>
	{/each}
</div>
