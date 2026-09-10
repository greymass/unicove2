<script lang="ts">
	import { getContext } from 'svelte';
	import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import SendIcon from '@lucide/svelte/icons/send';
	import { Button, Card } from '@wharfkit/svelte-components';

	import AssetText from '$lib/components/elements/asset.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const hasValue = $derived(
		context.network.supports('delphioracle') || context.settings.data.mockPrice
	);
</script>

{#if context.account}
	<section id="session-launcher" class="grid gap-6 pt-6">
		<Card>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
				<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
					<DollarSign />
				</picture>
				<div class="flex flex-1 flex-col gap-1">
					<p class="text-title leading-none">{context.account.name}</p>
					{#if hasValue}
						{#if market.account?.hasPrice}
							<AssetText
								class="text-on-surface text-left text-2xl leading-none font-bold"
								variant="full"
								value={market.account.value}
							/>
						{:else}
							<div
								class="bg-surface-container-high text-on-surface w-48 animate-pulse rounded text-2xl font-bold"
							>
								&nbsp;
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<div class="flex flex-wrap gap-4 pt-4">
				<Button variant="primary" href={context.urlPath(`/account/${context.account.name}`)}>
					Go to my account
				</Button>
				<Button variant="secondary" href={context.urlPath('/send')}>
					<span class="flex items-center gap-2"><SendIcon class="size-4" /> Send</span>
				</Button>
				<Button variant="secondary" href={context.urlPath('/swap')}>
					<span class="flex items-center gap-2"><ArrowLeftRightIcon class="size-4" /> Swap</span>
				</Button>
				{#if context.network.supports('staking')}
					<Button variant="secondary" href={context.urlPath('/staking')}>
						<span class="flex items-center gap-2"><LayersIcon class="size-4" /> Stake</span>
					</Button>
				{/if}
			</div>
		</Card>
	</section>
{/if}
