<!-- Staking calculator. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Asset } from '@wharfkit/antelope';

	import { Card, Stack, Table, TD, TR } from '@wharfkit/svelte-components';
	import { AssetInput } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		apr: string;
		network: NetworkState;
		tokenprice: Asset;
	}

	const { apr, network, tokenprice, ...props }: Props = $props();

	let assetValid: boolean = $state(true);
	let assetValue: Asset = $state(Asset.from(0, network.chain.systemToken!.symbol));
	let a = $derived(Number(apr) / 100);
	let d = $derived(a / 365);
	let mo = $derived(a / 12);
	let records = $derived.by(() => {
		let daily = Asset.fromUnits(Number(assetValue.units) * d, assetValue.symbol);
		let monthly = Asset.fromUnits(Number(assetValue.units) * mo, assetValue.symbol);
		let yearly = Asset.fromUnits(Number(assetValue.units) * a, assetValue.symbol);
		let price = tokenprice ? tokenprice.value : 0;
		return [
			{
				time: 'Daily',
				value: daily,
				currency: Asset.from(daily.value * price, tokenprice.symbol)
			},
			{
				time: 'Monthly',
				value: monthly,
				currency: Asset.from(monthly.value * price, tokenprice.symbol)
			},
			{
				time: 'Yearly',
				value: yearly,
				currency: Asset.from(yearly.value * price, tokenprice.symbol)
			}
		];
	});
</script>

<Card {...props} title="Staking Calculator">
	<Stack>
		<p>
			Enter an amount of {String(network.chain.systemToken!.symbol.name)} to calculate estimated rewards
			based on the current APR of {apr}%. This rate will change over time based on the amount of
			tokens staked.
		</p>

		<AssetInput min={0} bind:value={assetValue} bind:valid={assetValid} />

		<Table>
			{#each records as record}
				<TR>
					<TD class="text-label-sm">{record.time}</TD>
					<TD class="text-right text-sm">
						<AssetText class="text-on-surface" variant="full" value={record.value} />
					</TD>
					<TD class="text-right text-sm">{record.currency}</TD>
				</TR>
			{/each}
		</Table></Stack
	>
</Card>
