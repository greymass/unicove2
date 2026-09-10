<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import type { NetworkState } from '$lib/state/network.svelte';
	import StakedHEX from './stakedhex.svelte';
	import { getAPR } from '$lib/utils/staking';
	import { Button } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	interface Props {
		network: NetworkState;
	}

	let { network }: Props = $props();

	const { urlPath } = getContext<UnicoveContext>('state');

	const apr = $derived(getAPR(network.token.distribution?.staked));
</script>

<section class="@container grid gap-y-12">
	{#if network.token.distribution}
		<!-- Graphics -->
		<div class="row-start-1 grid place-items-center @3xl:col-start-2">
			<StakedHEX staked={network.token.distribution.staked} {apr} />
		</div>
	{/if}

	<!-- Text -->
	<Stack class="max-w-md items-start">
		<h2 class="text-title leading-tight">{network.token.name} Staking Rewards</h2>
		<p>Stake {network.token.name} today for an estimated {apr}% APR<sup>1</sup>.</p>
		<p>
			The {network.token.name} staking rewards program proportionally distributes 85.6k {String(
				network.chain.systemToken?.symbol.name
			)} daily to token holders who have staked their tokens. These tokens can be unstaked and will be
			usable again after a 21 day lockup period.
		</p>
		<div class="mt-2 flex items-center gap-6">
			<Button variant="primary" href={urlPath(`/staking`)}>Stake Tokens</Button>
			<Button variant="text" href="https://eosnetwork.com/staking-rewards/">Learn more</Button>
		</div>
		<p class="text-muted text-xs">
			<sup>1</sup>
			APR is based on the total amount staked and dynamically changes over time.
		</p>
	</Stack>
</section>
