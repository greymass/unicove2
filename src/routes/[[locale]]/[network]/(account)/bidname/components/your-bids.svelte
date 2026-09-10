<script lang="ts">
	import { getContext, onDestroy } from 'svelte';

	import { Button, Card, Stack } from '@wharfkit/svelte-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { BidnameApiResponse } from '$lib/state/bidname.svelte';
	import { Types } from '$lib/wharf/contracts/system';
	import { addTrackedName, getTrackedNames, removeTrackedName } from '../tracked';
	import { formatBidAmount } from '../formatting';

	type TrackedBidStatus =
		| 'leading'
		| 'outbid'
		| 'watching'
		| 'won'
		| 'claimed'
		| 'no_bids'
		| 'unknown';

	interface Props {
		accountName: string;
		trackedBidsData?: BidnameApiResponse['trackedBids'];
		ontrackchange?: () => void;
	}

	const { accountName, trackedBidsData, ontrackchange }: Props = $props();
	const { network, urlPath } = getContext<UnicoveContext>('state');

	interface TrackedBid {
		name: string;
		bid: Types.name_bid | undefined;
		refund: Types.bid_refund | undefined;
		status: TrackedBidStatus;
	}

	let loading = $derived(trackedBidsData === undefined && getTrackedNames(accountName).length > 0);

	function determineStatus(
		bid: Types.name_bid | undefined,
		refund: Types.bid_refund | undefined,
		account: string,
		accountExists: boolean
	): TrackedBidStatus {
		if (!bid) {
			if (accountExists) return 'claimed';
			if (refund) return 'claimed';
			return 'no_bids';
		}
		const highBid = bid.high_bid.toNumber();
		if (highBid < 0) return 'won';
		if (highBid > 0 && String(bid.high_bidder) === account) return 'leading';
		if (highBid > 0 && String(bid.high_bidder) !== account) {
			if (refund) return 'outbid';
			return 'watching';
		}
		return 'unknown';
	}

	function convertApiData(items: NonNullable<BidnameApiResponse['trackedBids']>): TrackedBid[] {
		return items.map(({ name, bid, refund, accountExists }) => {
			const bidObj = bid ? Types.name_bid.from(bid) : undefined;
			const refundObj = refund ? Types.bid_refund.from(refund) : undefined;
			const status = determineStatus(bidObj, refundObj, accountName, accountExists ?? false);
			return { name, bid: bidObj, refund: refundObj, status };
		});
	}

	const parentBids: TrackedBid[] = $derived(trackedBidsData ? convertApiData(trackedBidsData) : []);

	let pendingRemovals: string[] = $state([]);

	const trackedBids: TrackedBid[] = $derived(
		parentBids.filter((b) => !pendingRemovals.includes(b.name))
	);

	const symbol = $derived(network.config.systemtoken.id.symbol);

	function handleRemove(name: string) {
		removeTrackedName(accountName, name);
		pendingRemovals = [...pendingRemovals, name];
		ontrackchange?.();
	}

	function statusLabel(status: string): { text: string; classes: string } {
		switch (status) {
			case 'leading':
				return { text: 'Highest Bidder', classes: 'bg-success/15 text-success' };
			case 'outbid':
				return { text: 'Outbid', classes: 'bg-error/15 text-error' };
			case 'watching':
				return { text: 'Watching', classes: 'bg-primary/15 text-primary' };
			case 'won':
				return { text: 'Won', classes: 'bg-success/15 text-success' };
			case 'claimed':
				return { text: 'Claimed', classes: 'bg-surface-container-high text-muted' };
			case 'no_bids':
				return { text: 'No Bids', classes: 'bg-surface-container-high text-muted' };
			default:
				return { text: 'Unknown', classes: 'bg-surface-container-high text-muted' };
		}
	}

	let scanning = $state(false);
	let scannedRows = $state(0);
	let foundNames: string[] = $state([]);
	let scanError = $state('');
	let scanDone = $state(false);
	let abortController: AbortController | undefined;

	async function scanForBids() {
		scanning = true;
		scannedRows = 0;
		foundNames = [];
		scanError = '';
		scanDone = false;
		abortController = new AbortController();

		let cursor: string | undefined;

		try {
			while (true) {
				if (abortController.signal.aborted) break;

				const params = new URLSearchParams({ account: accountName, limit: '100' });
				if (cursor) params.set('cursor', cursor);
				const url = `/en/${network.config.short}/api/bidname/scan?${params}`;
				const res = await network.fetch(url, { signal: abortController.signal });
				if (!res.ok) throw new Error(`Scan request failed: ${res.status}`);
				const data: { found: string[]; nextCursor: string | null; scanned: number } =
					await res.json();
				if ('error' in data && data.error) throw new Error(String(data.error));

				scannedRows += data.scanned;
				for (const name of data.found) {
					if (!foundNames.includes(name)) {
						foundNames = [...foundNames, name];
						addTrackedName(accountName, name);
					}
				}

				if (!data.nextCursor) break;
				cursor = data.nextCursor;
			}
		} catch (e) {
			if (!(e instanceof DOMException && e.name === 'AbortError')) {
				scanError = String(e);
			}
		} finally {
			scanning = false;
			scanDone = true;
			abortController = undefined;
			ontrackchange?.();
		}
	}

	function cancelScan() {
		abortController?.abort();
	}

	onDestroy(() => {
		abortController?.abort();
	});
</script>

<Card id="monitored-names" title="Monitored Names">
	<Stack>
		{#if scanning}
			<div class="bg-surface-container-high rounded-lg p-4">
				<p class="text-on-surface text-sm font-medium">Scanning auction table…</p>
				<p class="text-muted mt-1 text-sm">
					{scannedRows.toLocaleString()} records checked{#if foundNames.length > 0}, {foundNames.length}
						name{foundNames.length === 1 ? '' : 's'} found{/if}
				</p>
				<div class="mt-2">
					<Button variant="secondary" onclick={cancelScan}>Cancel</Button>
				</div>
			</div>
		{:else if scanDone && !scanError}
			<div class="bg-success/5 border-success/30 rounded-lg border p-4">
				<p class="text-on-surface text-sm">
					Scan complete — checked {scannedRows.toLocaleString()} records{#if foundNames.length > 0},
						added {foundNames.length} name{foundNames.length === 1 ? '' : 's'}{:else}, no new names
						found{/if}.
				</p>
			</div>
		{:else if scanError}
			<div class="bg-error/5 border-error/30 rounded-lg border p-4">
				<p class="text-on-surface text-sm">Scan failed: {scanError}</p>
				{#if foundNames.length > 0}
					<p class="text-muted mt-1 text-xs">
						Partial results: {foundNames.length} name{foundNames.length === 1 ? '' : 's'} added from
						{scannedRows.toLocaleString()} records checked.
					</p>
				{/if}
			</div>
		{/if}

		{#if loading}
			<p class="text-muted text-sm">Loading tracked names...</p>
		{:else if trackedBids.length === 0}
			<p class="text-muted text-sm">
				Search for a name above and click Track to monitor its bid status.
			</p>
		{:else}
			<div class="flex flex-col gap-2">
				{#each trackedBids as tracked}
					{@const badge = statusLabel(tracked.status)}
					<div class="bg-surface-container-high rounded-lg p-4">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="text-on-surface truncate font-bold">{tracked.name}</span>
									<span
										class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {badge.classes}"
									>
										{badge.text}
									</span>
								</div>
								{#if tracked.bid}
									<div class="mt-1 flex flex-col gap-0.5">
										<p class="text-on-surface text-sm">
											<span class="text-muted">High bid:</span>
											{formatBidAmount(Math.abs(tracked.bid.high_bid.toNumber()), symbol)}
										</p>
										<p class="text-sm">
											<span class="text-muted">Bidder:</span>
											<AccountLink name={tracked.bid.high_bidder} />
										</p>
									</div>
								{:else if tracked.status === 'no_bids'}
									<p class="text-muted mt-1 text-sm">No one has bid on this name yet.</p>
								{/if}
							</div>
							<button
								class="text-muted hover:text-on-surface shrink-0 p-1 text-sm"
								onclick={() => handleRemove(tracked.name)}
								title="Stop tracking"
								aria-label="Stop tracking {tracked.name}"
							>
								✕
							</button>
						</div>
						{#if tracked.status === 'outbid'}
							<p class="text-error mt-2 text-sm font-medium">
								You have been outbid on this name.{#if tracked.refund}{' '}You have {String(
										tracked.refund.amount
									)} available to reclaim.{/if}
							</p>
							<div class="mt-3 inline-flex flex-wrap gap-2">
								<Button href={urlPath(`/bidname/bid?name=${tracked.name}`)} variant="secondary">
									Place Bid
								</Button>
								{#if tracked.refund}
									<Button
										href={urlPath(`/bidname/refund?name=${tracked.name}`)}
										variant="secondary"
									>
										Claim Refund ({String(tracked.refund.amount)})
									</Button>
								{/if}
							</div>
						{:else if tracked.status === 'won'}
							<div class="mt-3 inline-flex">
								<Button href={urlPath(`/bidname/claim?name=${tracked.name}`)} variant="primary">
									Claim Name
								</Button>
							</div>
						{:else if tracked.status === 'watching'}
							<div class="mt-3 inline-flex">
								<Button href={urlPath(`/bidname/bid?name=${tracked.name}`)} variant="secondary">
									Place Bid
								</Button>
							</div>
						{:else if tracked.status === 'no_bids'}
							<div class="mt-3 inline-flex">
								<Button href={urlPath(`/bidname/bid?name=${tracked.name}`)} variant="secondary">
									Place Bid
								</Button>
							</div>
						{:else if tracked.status === 'claimed'}
							<div class="mt-3 inline-flex">
								<Button variant="secondary" onclick={() => handleRemove(tracked.name)}>
									Untrack
								</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		{#if !scanning}
			<div class="text-center">
				<Button variant="text" class="text-xs" onclick={scanForBids}>Find my bids</Button>
			</div>
		{/if}
	</Stack>
</Card>
