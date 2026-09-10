<script lang="ts">
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import { Shield } from '@lucide/svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	const badges = $derived.by(() => {
		const baseBadges = page.data?.header?.badges ?? [];

		// Add block producer badge for account pages
		if (page.data?.account?.name && context.producers.producers.length > 0) {
			const accountName = page.data.account.name;
			if (context.producers.isProducer(accountName)) {
				const isTop21 = context.producers.isTop21(accountName);
				return [
					...baseBadges,
					{
						icon: Shield,
						tooltip: isTop21 ? 'Top 21 Block Producer' : 'Block Producer',
						class: isTop21 ? 'text-success size-4' : 'text-on-surface-variant size-4'
					}
				];
			}
		}

		return baseBadges;
	});
</script>

<Stack tag="article" class="@container flex-1 gap-6">
	{#if page.data.title}
		<Pageheader
			network={data.network}
			title={page.data.title}
			subtitle={page.data.subtitle}
			backPath={page.data.backPath}
			actions={page.data?.header?.actions}
			copyData={page.data?.header?.copyData}
			{badges}
		/>
	{/if}

	{@render children?.()}
</Stack>
