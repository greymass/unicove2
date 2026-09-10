<script lang="ts">
	import { getContext } from 'svelte';
	import TokenPriceHistory from '$lib/components/chart/tokenpricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import TextBlock from './text-block.svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { ramtoken, systemtoken } from '$lib/wharf/chains';

	const { network, urlPath } = getContext<UnicoveContext>('state');

	const funding = network.supports('directfunding');
</script>

<section id="charts" class="@container grid grid-cols-2 gap-12 xl:grid-cols-2 xl:gap-x-12">
	<Stack class="col-span-full @3xl:col-span-1">
		<TokenPriceHistory />

		<TextBlock
			{...{
				title: `${String(network.token.symbol.name)}: The Native Token`,
				text: `The ${network.chain.name} network's native token, ${String(network.token.symbol.name)}, can be used for staking rewards, to buy and sell RAM, to pay transaction fees, and more. It is traded on most major exchanges.`,
				button: funding
					? {
							text: 'Get Tokens',
							href: urlPath(`/fund`)
						}
					: {
							text: `Send ${String(network.token.symbol.name)} Tokens`,
							href: urlPath(`/send`)
						}
			}}
		/>
	</Stack>

	<Stack class="col-span-full @3xl:col-span-1">
		<RamPriceHistory />

		<TextBlock
			{...{
				title: 'KB (RAM): Tokenized Data Storage',
				text: `One ${ramtoken.name} of RAM represents ownership rights over 1000 bytes of the network's total blockchain storage capacity. ${ramtoken.name} can be swapped with ${systemtoken.name} by visiting the RAM Market.`,
				button: {
					text: `Swap ${String(network.chain.systemToken?.symbol.name)}/${String(ramtoken.name)}`,
					href: urlPath(`/swap/${systemtoken.id.url}/${ramtoken.id.url}`)
				}
			}}
		/>
	</Stack>
</section>
