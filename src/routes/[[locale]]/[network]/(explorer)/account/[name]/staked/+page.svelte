<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { Card, DL, Stack, Switcher } from '@wharfkit/svelte-components';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import {
		getStakedBalance,
		getClaimableBalance,
		getWithdrawableBalance,
		getUnstakingBalances,
		getUnstakableBalance,
		getAPR
	} from '$lib/utils/staking';

	import UnstakingBalances from '$lib/components/elements/unstaking.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
	const { network } = getContext<MarketContext>('market');

	const { data } = $props();

	let staked: Asset = $derived(getStakedBalance(data.network, data.account));
	let claimable: Asset = $derived(getClaimableBalance(data.network, data.account));
	let withdrawable: Asset = $derived(getWithdrawableBalance(data.network, data.account));
	let unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(data.network, data.account)
	);
	let unstakable: Asset = $derived(getUnstakableBalance(data.network, data.account, unstaking));
	let apr: string = $derived(getAPR(data.network.token.distribution?.staked));
	let usdValue = $derived(
		Asset.from(
			staked.value * (network.systemtoken.price ? network.systemtoken.price.value : 0),
			'2,USD'
		)
	);

	const items = $derived([
		{
			title: 'Total staked',
			description: String(staked)
		},

		{ title: 'Total value', description: String(usdValue) },

		{
			title: 'APR',
			description: `${apr} % `
		},

		{
			title: 'Savings',
			description: String(context.network.tokenToRex(unstakable))
		},

		{
			title: 'Available for claim',
			description: String(context.network.tokenToRex(claimable))
		},

		{
			title: 'REX fund',
			description: String(withdrawable)
		}
	]);
</script>

<Stack>
	{#if data.account}
		<Stack>
			<Switcher threshold="64rem" class="place-content-between">
				<Card title="Staked">
					<DL {items} />
				</Card>
				<UnstakingBalances records={unstaking} />
			</Switcher>
		</Stack>
	{:else}
		<p>Loading staking details...</p>
	{/if}
</Stack>
