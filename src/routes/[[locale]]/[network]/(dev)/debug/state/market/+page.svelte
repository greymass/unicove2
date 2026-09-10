<script lang="ts">
	import { Button } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import type { MarketContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<MarketContext>('market');

	const pairs = $derived(context.market.pairs);
	const pairsList = $derived(
		pairs.map((pair) => `${pair.base.symbol}-${pair.quote.symbol} @ ${pair.price}`)
	);
	const refreshed = $derived(context.market.refreshed);
</script>

<div class="space-y-6">
	<Button onclick={() => context.market.refresh()}>Refresh</Button>
	<p>Updated {refreshed}</p>

	<h3 class="text-title">TokenPairs ({pairs.length})</h3>
	<Code collapsible json={pairsList}></Code>

	<h3 class="text-title">Historic</h3>
	<Code collapsible json={context.market.historic}></Code>

	<h3 class="text-title">MarketContext</h3>
	<Code>
		{JSON.stringify(context, undefined, 2)}
	</Code>
</div>
