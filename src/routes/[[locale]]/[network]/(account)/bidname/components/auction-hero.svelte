<script lang="ts">
	import { Asset, type BlockTimestamp } from '@wharfkit/antelope';
	import { Timer } from '@lucide/svelte';
	import { getContext, onMount } from 'svelte';

	import { Button, Card, Stack } from '@wharfkit/svelte-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Types } from '$lib/wharf/contracts/system';
	import { formatCountdown } from '../formatting';

	interface Props {
		bid: Types.name_bid | undefined;
		lastNameClose: BlockTimestamp | undefined;
	}

	const { bid, lastNameClose }: Props = $props();
	const { network, urlPath } = getContext<UnicoveContext>('state');

	let now = $state(Date.now());

	onMount(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(interval);
	});

	const bidAsset = $derived(
		bid ? Asset.fromUnits(bid.high_bid, network.config.systemtoken.symbol) : undefined
	);

	const DAY_MS = 24 * 60 * 60 * 1000;

	const closeEligibleTime = $derived.by(() => {
		if (!bid) return 0;
		const bidEligible = bid.last_bid_time.toMilliseconds() + DAY_MS;
		const closeEligible = lastNameClose ? lastNameClose.toMilliseconds() + DAY_MS : 0;
		return Math.max(bidEligible, closeEligible);
	});

	const timeRemaining = $derived(Math.max(0, closeEligibleTime - now));
	const isEligible = $derived(timeRemaining === 0 && !!bid);
</script>

<Card class="from-primary/10 to-primary/5 border-primary/20 border bg-gradient-to-br">
	<Stack>
		{#if !bid}
			<div class="flex flex-col items-center justify-center py-8">
				<Timer class="text-muted mb-3 size-10" />
				<p class="text-muted text-lg">No active auctions</p>
			</div>
		{:else}
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-col gap-2">
					<p class="text-muted text-sm font-medium tracking-wider uppercase">
						Next Auction to Close
					</p>
					<h2 class="text-on-surface text-3xl font-bold tracking-tight">
						{String(bid.newname)}
					</h2>
					<div class="flex flex-col gap-1">
						<p class="text-on-surface text-lg font-semibold">
							{bidAsset ? String(bidAsset) : ''}
						</p>
						<p class="text-muted text-sm">
							High bidder: <AccountLink name={bid.high_bidder} />
						</p>
					</div>
				</div>

				<div class="flex flex-col items-start gap-3 sm:items-end">
					{#if isEligible}
						<div class="bg-success/15 text-success rounded-lg px-4 py-2">
							<p class="text-sm font-medium tracking-wider uppercase">Status</p>
							<p class="text-xl font-bold">Eligible to close</p>
						</div>
					{:else}
						<div class="bg-surface-container rounded-lg px-4 py-2 text-center">
							<p class="text-muted text-sm font-medium tracking-wider uppercase">Closes in</p>
							<p class="text-on-surface font-mono text-2xl font-bold">
								{formatCountdown(timeRemaining)}
							</p>
						</div>
					{/if}
					<Button href={urlPath(`/bidname/bid?name=${String(bid.newname)}`)} variant="primary">
						Place Bid
					</Button>
				</div>
			</div>
		{/if}
	</Stack>
</Card>
