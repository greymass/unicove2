<script lang="ts">
	import { getContext } from 'svelte';
	import { ChevronRight } from '@lucide/svelte';

	import AssetText from '$lib/components/elements/asset.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import type { TokenSwap } from '$lib/types/token';

	import { describeSwap, swapRate, tokenLabel, unitPrice } from '../describe.svelte';
	import SwapIcon from './swapicon.svelte';

	interface Props {
		swap: TokenSwap;
	}

	const { swap }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const describe = $derived(describeSwap(context.network, swap));
	const base = $derived(tokenLabel(context.network, swap.pair.base));
	const quote = $derived(tokenLabel(context.network, swap.pair.quote));
	const href = $derived(
		context.urlPath(`/swap/${swap.pair.base.id.url}/${swap.pair.quote.id.url}`)
	);

	const price = $derived(unitPrice(context.network, market.network, swap.pair.base));
	const rate = $derived(swapRate(context.network, swap));
</script>

<a
	{href}
	class="hover:bg-surface-container focus-visible:outline-primary grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 rounded-xl px-3 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:grid-cols-[auto_1fr_auto_auto]"
>
	<SwapIcon kind={describe.kind} />

	<span class="col-start-2 min-w-0">
		<span class="text-label text-on-surface block truncate">{describe.title}</span>
		<span class="text-muted block truncate font-mono text-sm tabular-nums">
			<span>{base} → {quote}</span>
		</span>
	</span>

	<span class="col-start-2 row-start-2 min-w-0 sm:col-start-3 sm:row-start-1 sm:text-right">
		<AssetText
			class="text-on-surface block font-mono font-medium"
			value={rate.price}
			variant="full"
		/>
		<span class="text-muted block text-sm">
			<span>per 1 {rate.per}</span>
			{#if describe.fixedRate}
				<span>fixed</span>
			{:else if price}
				<AssetText class="inline" value={price} variant="value" />
			{/if}
		</span>
	</span>

	<ChevronRight
		class="text-muted col-start-3 row-start-1 sm:col-start-4"
		size={18}
		aria-hidden="true"
	/>
</a>
