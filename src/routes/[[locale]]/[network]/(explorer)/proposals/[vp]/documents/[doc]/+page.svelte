<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import { ChevronDown } from '@lucide/svelte';
	import { page } from '$app/state';
	import { localizePath } from '$lib/utils/url';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpMarkdown from '$lib/components/vp/VpMarkdown.svelte';
	import VpStaleNotice from '$lib/components/vp/VpStaleNotice.svelte';
	import { vpDocumentLabel, vpDocumentStem } from '$lib/vp/documents';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const basePath = $derived(urlPath('/proposals'));
	const documentsPath = $derived(urlPath(`/proposals/${page.params.vp}/documents`));
	const docPath = (stem: string) => `${documentsPath}/${stem}`;
	const englishHref = $derived(localizePath(page.url.pathname, { forceLocale: 'en' }));
	const locale = $derived(page.params.locale ?? 'en');

	const prev = $derived(data.docPosition > 0 ? data.summary.documents[data.docPosition - 1] : null);
	const next = $derived(
		data.docPosition < data.summary.documents.length - 1
			? data.summary.documents[data.docPosition + 1]
			: null
	);
</script>

<Stack class="gap-6">
	{#if data.docStale}
		<VpStaleNotice {englishHref} />
	{/if}

	<Card class="p-6 sm:p-8">
		<header class="mb-6">
			<h1 class="text-headline-sm text-balance">{data.docHeading}</h1>
			<p class="text-muted mt-2 text-sm">
				Document {data.docPosition + 1} of {data.summary.documents.length}
				{#if data.document.statusLine}&middot; {data.document.statusLine}{/if}
				&middot; {data.document.words.toLocaleString()} words &middot; {data.document.minutes} min read
				{#if locale !== 'en' && data.docLang === 'en'}
					&middot; This document is available in English only.
				{/if}
			</p>
		</header>
		{#if data.toc.length}
			<details class="group border-outline-variant mb-6 rounded-lg border">
				<summary
					class="hover:bg-surface-container flex cursor-pointer list-none items-center justify-between gap-2 rounded-[inherit] p-3 text-sm font-medium transition-colors select-none [&::-webkit-details-marker]:hidden"
				>
					Contents
					<ChevronDown
						class="text-muted size-4 shrink-0 transition-transform duration-150 group-open:rotate-180"
					/>
				</summary>
				<ul class="space-y-1 p-3 pt-0 text-sm">
					{#each data.toc as entry (entry.id)}
						<li class={entry.depth === 3 ? 'pl-4' : entry.depth === 1 ? 'font-medium' : ''}>
							<a class="text-muted hover:text-on-surface hover:underline" href="#{entry.id}"
								>{entry.text}</a
							>
						</li>
					{/each}
				</ul>
			</details>
		{/if}
		<VpMarkdown
			body={data.document.body}
			slug={data.summary.slug}
			{basePath}
			branch={data.branch}
		/>
	</Card>

	<div class="flex justify-between gap-4 text-sm">
		{#if prev}
			<a class="hover:underline" href={docPath(vpDocumentStem(prev.path))}
				>&larr; {vpDocumentLabel(prev)}</a
			>
		{:else}
			<a class="hover:underline" href={documentsPath}>&larr; All documents</a>
		{/if}
		{#if next}
			<a class="hover:underline" href={docPath(vpDocumentStem(next.path))}
				>{vpDocumentLabel(next)} &rarr;</a
			>
		{:else}
			<a class="hover:underline" href={documentsPath}>All documents &rarr;</a>
		{/if}
	</div>
</Stack>
