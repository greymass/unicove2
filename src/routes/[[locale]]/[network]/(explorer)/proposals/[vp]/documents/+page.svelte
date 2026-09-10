<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const docHref = (stem: string) => urlPath(`/proposals/${page.params.vp}/documents/${stem}`);
</script>

<Stack>
	{#each data.documentListings as doc, i (doc.stem)}
		<a class="group block" href={docHref(doc.stem)}>
			<Card class="group-hover:bg-surface-container transition-colors">
				<Stack class="gap-2">
					<div class="flex flex-wrap items-center gap-3">
						<span class="text-label-sm text-muted"
							>Document {i + 1} of {data.documentListings.length}</span
						>
						{#if doc.words !== null && doc.minutes !== null}
							<span class="text-muted ml-auto text-sm">
								{doc.words.toLocaleString()} words &middot; {doc.minutes} min read
							</span>
						{/if}
					</div>
					<span class="text-title group-hover:underline">{doc.heading}</span>
					{#if doc.statusLine}
						<p class="text-muted max-w-[60ch] text-sm">{doc.statusLine}</p>
					{/if}
				</Stack>
			</Card>
		</a>
	{/each}
</Stack>
