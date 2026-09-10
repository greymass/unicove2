<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import { getContext, onMount } from 'svelte';

	import { Stack, AssetInput, Button, Label } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import AccountText from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import { BidManager } from './manager.svelte';
	import { formatCountdown, formatBidAmount } from '../../formatting';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: BidManager = $state(new BidManager(data.network));
	let input: AssetInput | undefined = $state();
	let ready = $derived(manager.canBid && !context.wharf.transacting);
	let showRules = $state(false);

	let now = $state(Date.now());

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	onMount(() => {
		const name = page.url.searchParams.get('name');
		if (name) {
			manager.bidName = name;
		}
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (context.account && manager.bidName) {
			manager.loadBidData();
		}
	});

	const currentBidAsset = $derived(
		manager.currentBid && manager.network
			? Asset.fromUnits(manager.currentBid.high_bid, manager.network.config.systemtoken.symbol)
			: undefined
	);

	const maxValue = $derived(
		context.account?.balance?.balance ? context.account.balance.balance.value : 0
	);

	const minValue = $derived(manager.minimumBid.value);

	const timeRemaining = $derived(Math.max(0, manager.auctionCloseTime - now));
	const auctionEligible = $derived(timeRemaining === 0 && !!manager.leadingBid);

	const symbol = $derived(manager.network?.config.systemtoken.symbol);

	function resetState() {
		manager = new BidManager(data.network);
		const name = page.url.searchParams.get('name');
		if (name) {
			manager.bidName = name;
		}
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={context.urlPath(`/bidname`)} variant="secondary">Back to Premium Names</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Try Again</Button>
	{:else if !manager.bidName}
		<p class="text-muted">No name specified. Go back to browse available names.</p>
		<Button href={context.urlPath(`/bidname`)} variant="secondary">Browse Names</Button>
	{:else if manager.isWon}
		<Stack class="gap-4">
			<p class="text-on-surface text-2xl font-bold">{manager.bidName}</p>
			<div class="border-outline-variant/30 bg-surface-container-high rounded-xl border p-4">
				<p class="text-on-surface text-sm font-medium">This name has been claimed</p>
				<p class="text-muted mt-1 text-xs leading-relaxed">
					<strong class="text-on-surface-variant">{manager.bidName}</strong>
					{#if manager.currentBid?.high_bidder}
						was won by <AccountText name={manager.currentBid.high_bidder} /> and is
					{:else}
						is
					{/if}
					no longer available for bidding.
				</p>
			</div>
			<Button href={context.urlPath(`/bidname`)} variant="secondary">Browse Names</Button>
		</Stack>
	{:else}
		<Stack class="gap-4">
			<Stack class="gap-1">
				<p class="text-on-surface text-2xl font-bold">{manager.bidName}</p>
				{#if manager.loading}
					<p class="text-muted text-sm">Loading auction data...</p>
				{:else if currentBidAsset}
					<p class="text-muted text-sm">
						Current high bid: <strong class="text-on-surface">{String(currentBidAsset)}</strong>
						by
						{#if manager.currentBid?.high_bidder}
							<AccountText name={manager.currentBid.high_bidder} />
						{/if}
					</p>
				{:else}
					<p class="text-muted text-sm">No bids yet — you would be the first bidder.</p>
				{/if}
			</Stack>

			<p class="text-muted text-xs leading-relaxed">
				Premium names are sold through a global auction. The name with the highest bid closes first,
				once 24 hours pass without a higher bid on any name.
			</p>

			{#if manager.isHighBidder}
				<div class="border-primary/30 bg-primary/5 rounded-xl border p-4">
					<p class="text-on-surface text-sm font-medium">You are the current high bidder</p>
					<p class="text-muted mt-1 text-xs leading-relaxed">
						Placing a new bid will replace your existing one — bids are not additive. Your previous
						bid amount becomes refundable.
					</p>
				</div>
			{/if}

			{#if manager.hasRefund && !manager.isHighBidder}
				<div class="border-warning/30 bg-warning/5 rounded-xl border p-4">
					<p class="text-on-surface text-sm font-medium">You were outbid</p>
					<p class="text-muted mt-1 text-xs leading-relaxed">
						Your previous bid of
						<strong class="text-on-surface-variant">{String(manager.refundAmount)}</strong>
						is available to reclaim.
						<a
							href={context.urlPath('/bidname/refund')}
							class="text-primary hover:text-primary/80 underline">Claim refund</a
						>
					</p>
				</div>
			{/if}

			<div class="bg-surface-container-high space-y-4 rounded-xl p-4">
				<div class="text-muted flex items-baseline justify-between text-sm">
					<span>
						Minimum bid: <strong class="text-on-surface">{String(manager.minimumBid)}</strong>
					</span>
					{#if context.account?.balance?.balance}
						<span>
							Balance: <strong class="text-on-surface"
								>{String(context.account.balance.balance)}</strong
							>
						</span>
					{/if}
				</div>

				<fieldset class="grid gap-2">
					<Label for="assetInput">Your bid</Label>
					<AssetInput
						autofocus
						bind:this={input}
						bind:value={manager.bidAmount}
						bind:valid={manager.bidValid}
						min={minValue}
						max={maxValue}
					/>
				</fieldset>

				{#if !manager.bidValid && manager.bidAmount.value > 0}
					{#if manager.bidAmount.value > maxValue && maxValue > 0}
						<p class="text-error text-sm">Amount exceeds available balance.</p>
					{:else if manager.bidAmount.units.toNumber() < manager.minimumBid.units.toNumber()}
						<p class="text-error text-sm">
							Bid must be at least {String(manager.minimumBid)}.
						</p>
					{/if}
				{/if}
			</div>

			{#if manager.canBid && manager.wouldBecomeTopBid}
				<div class="border-success/30 bg-success/5 rounded-xl border p-4">
					<p class="text-on-surface text-sm font-medium">This would become the top bid</p>
					<p class="text-muted mt-1 text-xs leading-relaxed">
						Your bid will surpass all current auctions and start a new 24-hour countdown. If no
						higher bid is placed on any name within 24 hours, you can claim
						<strong class="text-on-surface-variant">{manager.bidName}</strong>.
					</p>
				</div>
			{:else if manager.canBid && manager.leadingBid && !manager.wouldBecomeTopBid}
				<div class="border-warning/30 bg-warning/5 rounded-xl border p-4">
					<p class="text-on-surface text-sm font-medium">
						You'd lead this name, but not the global auction
					</p>
					<p class="text-muted mt-1 text-xs leading-relaxed">
						You'll become the highest bidder on
						<strong class="text-on-surface-variant">{manager.bidName}</strong>, but
						<strong class="text-on-surface-variant">{String(manager.leadingBid.newname)}</strong>
						at {String(manager.leadingBidAsset)} is currently first in line to close. Your name can only
						close after that auction ends.
					</p>
				</div>
			{/if}

			<Button disabled={!ready} onclick={() => manager.transact()} variant="primary">
				Place Bid
			</Button>

			{#if manager.currentBid && manager.topBids.length > 0 && symbol}
				<div class="space-y-2">
					{#if manager.leadingBid && String(manager.currentBid.newname) === String(manager.leadingBid.newname)}
						<div class="border-success/30 bg-success/5 rounded-xl border p-3">
							<p class="text-on-surface text-sm">
								This name is next to close —
								{#if auctionEligible}
									<strong class="text-on-surface-variant">eligible now</strong>.
								{:else}
									countdown: <strong class="text-on-surface-variant font-mono"
										>{formatCountdown(timeRemaining)}</strong
									>
								{/if}
							</p>
						</div>
					{:else if manager.namesAheadInQueue.length > 0}
						<p class="text-muted text-xs font-medium tracking-wide uppercase">Auction Queue</p>
						<div class="border-outline-variant/30 rounded-xl border">
							{#each manager.namesAheadInQueue as bid, i}
								<div
									class="border-outline-variant/20 flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
								>
									<span class="text-muted w-5 text-right text-xs">{i + 1}</span>
									<span class="text-on-surface flex-1 truncate text-sm font-bold"
										>{String(bid.newname)}</span
									>
									<span class="text-muted text-sm">{formatBidAmount(bid.high_bid, symbol)}</span>
								</div>
							{/each}
							<div class="bg-primary/10 flex items-center gap-3 px-3 py-2">
								<span class="text-muted w-5 text-right text-xs"
									>{manager.namesAheadInQueue.length + 1}</span
								>
								<span class="text-on-surface flex-1 truncate text-sm font-bold"
									>{manager.bidName}</span
								>
								<span class="text-muted text-sm"
									>{currentBidAsset ? String(currentBidAsset) : '—'}</span
								>
							</div>
						</div>
						<p class="text-muted text-xs leading-relaxed">
							Each name ahead must close in turn before this one can. Any new highest bid on any
							name resets the 24-hour timer for everyone.
						</p>
					{/if}
				</div>
			{/if}

			<div class="text-center">
				<Button variant="text" class="text-xs" onclick={() => (showRules = !showRules)}>
					{showRules ? 'Hide' : 'Learn more about auctions'}
				</Button>
			</div>
			{#if showRules}
				<div class="text-muted space-y-3 text-xs leading-relaxed">
					<div>
						<p class="text-on-surface-variant mb-1 font-medium">One at a time</p>
						<p>
							Only the name with the highest bid can close.{#if manager.leadingBid && manager.leadingBidAsset}{' '}Currently
								that's
								<strong class="text-on-surface-variant">{String(manager.leadingBid.newname)}</strong
								>
								at {String(manager.leadingBidAsset)}.{/if}
						</p>
					</div>
					<div>
						<p class="text-on-surface-variant mb-1 font-medium">24-hour countdown</p>
						<p>
							The leading auction must go 24 hours without any new highest bid on any name.{' '}
							{#if manager.leadingBid}
								{#if auctionEligible}
									Timer: <strong class="text-on-surface-variant">Eligible now</strong>.
								{:else}
									Timer: <strong class="text-on-surface-variant font-mono"
										>{formatCountdown(timeRemaining)}</strong
									>
								{/if}
							{/if}
						</p>
					</div>
					<div>
						<p class="text-on-surface-variant mb-1 font-medium">10% minimum increase</p>
						<p>
							Each bid must beat the current by at least 10%.{#if currentBidAsset}{' '}For
								<strong class="text-on-surface-variant">{manager.bidName}</strong>, that's at least
								<strong class="text-on-surface-variant">{String(manager.minimumBid)}</strong>.{/if}
						</p>
					</div>
					<div>
						<p class="text-on-surface-variant mb-1 font-medium">Refunds</p>
						<p>
							Outbid tokens are reclaimable on the refund page.{#if manager.hasRefund}{' '}You have
								<strong class="text-on-surface-variant">{String(manager.refundAmount)}</strong>
								to reclaim.{/if}
						</p>
					</div>
					<div>
						<p class="text-on-surface-variant mb-1 font-medium">No guaranteed timeline</p>
						<p>
							Names ahead in the queue must close first. New bids on any name can extend the
							process. The queue shows current order but can change at any time.
						</p>
					</div>
				</div>
			{/if}
		</Stack>
	{/if}
</Stack>
