<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import { localizePath } from '$lib/utils/url';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpMarkdown from '$lib/components/vp/VpMarkdown.svelte';
	import VpLanguageNav from '$lib/components/vp/VpLanguageNav.svelte';
	import VpStaleNotice from '$lib/components/vp/VpStaleNotice.svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const basePath = $derived(urlPath('/proposals'));
	const englishHref = $derived(localizePath(page.url.pathname, { forceLocale: 'en' }));
</script>

<Stack class="gap-6">
	{#if data.stale}
		<VpStaleNotice {englishHref} />
	{/if}
	<Card class="p-6 sm:p-8">
		<div class="mb-6">
			<VpLanguageNav summary={data.summary} current={data.lang} />
		</div>
		<VpMarkdown body={data.body} slug={data.summary.slug} {basePath} branch={data.branch} />
	</Card>
</Stack>
