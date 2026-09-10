<script lang="ts">
	import { getContext, onMount } from 'svelte';

	import { MultiCard } from '$lib/components/layout';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { BidnameState, type BidnameApiResponse } from '$lib/state/bidname.svelte';
	import AuctionHero from './components/auction-hero.svelte';
	import BidList from './components/bid-list.svelte';
	import BidSearch from './components/bid-search.svelte';
	import YourBids from './components/your-bids.svelte';
	import { getTrackedNames } from './tracked';

	const REFRESH_INTERVAL = 30_000;

	const context = getContext<UnicoveContext>('state');

	const { data } = $props();

	const bidnameState = new BidnameState(data.network);

	let trackedBidsData: BidnameApiResponse['trackedBids'] = $state(undefined);

	function getAccountName(): string | undefined {
		if (context.account) return String(context.account.name);
		const stored = context.wharf.chainsSession[String(data.network.chain.id)];
		return stored?.actor ? String(stored.actor) : undefined;
	}

	async function refresh() {
		const accountName = getAccountName();
		const names = accountName ? getTrackedNames(accountName) : [];

		const response = await bidnameState.fetchAll({
			top: 10,
			names: names.length > 0 ? names : undefined,
			account: accountName
		});

		if (response && accountName) {
			trackedBidsData = names.length > 0 ? (response.trackedBids ?? []) : [];
		}
	}

	onMount(() => {
		refresh();
		const interval = setInterval(refresh, REFRESH_INTERVAL);
		return () => clearInterval(interval);
	});
</script>

{#if data.network.supports('bidname')}
	<MultiCard>
		{#snippet leftColumn()}
			<AuctionHero bid={bidnameState.leadingBid} lastNameClose={bidnameState.lastNameClose} />

			<Card id="top-bids" title="Top Active Bids">
				<BidList bids={bidnameState.topBids} loading={bidnameState.loading} />
			</Card>
		{/snippet}

		{#snippet rightColumn()}
			<Card id="search" title="Search Names">
				<BidSearch
					accountName={context.account ? String(context.account.name) : undefined}
					ontrackchange={refresh}
				/>
			</Card>

			{#if context.account}
				<YourBids
					accountName={String(context.account.name)}
					{trackedBidsData}
					ontrackchange={refresh}
				/>
			{/if}
		{/snippet}
	</MultiCard>
{:else}
	<p>Premium name bidding is not available on {data.network.chain.name}.</p>
{/if}
