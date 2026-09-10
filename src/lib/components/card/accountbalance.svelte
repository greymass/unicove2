<script lang="ts">
	import { getContext } from 'svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';

	import { Card, Stack } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import { Chip } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	interface Props {
		cta?: {
			label: string;
			href: string;
		};
		title?: string;
		class?: string;
	}

	const { cta, title = 'Account Balance', ...props }: Props = $props();
</script>

<Card class={props.class} {title}>
	<Stack>
		<Stack class="gap-2">
			<h4 class="text-muted text-base leading-none">Available</h4>
			<p class="text-on-surface text-xl leading-none font-semibold">
				{#if context.account}
					<AssetText variant="full" value={context.account?.balance?.balance} />
				{:else}
					Not logged in
				{/if}
			</p>
			{#if market.account?.systemtoken?.liquid}
				<Chip>
					<AssetText variant="full" value={market.account?.systemtoken?.liquid} />
				</Chip>
			{/if}
		</Stack>

		{#if cta}
			<Stack class="gap-2">
				<Button href={cta.href}>{cta.label}</Button>
			</Stack>
		{/if}
	</Stack>
</Card>
