<script lang="ts">
	import { getContext } from 'svelte';

	import { Button, Stack } from '@wharfkit/svelte-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { BidnameApiResponse } from '$lib/state/bidname.svelte';
	import { Types } from '$lib/wharf/contracts/system';
	import { addTrackedName, canTrackMore, getTrackedNames, removeTrackedName } from '../tracked';
	import { formatBidAmount, formatRelativeTime } from '../formatting';

	interface Props {
		accountName?: string;
		ontrackchange?: () => void;
	}

	const { accountName, ontrackchange }: Props = $props();
	const { network, urlPath } = getContext<UnicoveContext>('state');

	let query = $state('');
	let result: import('$lib/wharf/contracts/system').Types.name_bid | undefined | null =
		$state(null);
	let searching = $state(false);
	let accountExists = $state(false);
	let validationError = $state('');
	let searchError = $state('');

	let trackVersion = $state(0);

	const searchedName = $derived(query.trim().toLowerCase());

	const tracked: boolean = $derived.by(() => {
		void trackVersion;
		if (!accountName || !searchedName) return false;
		return getTrackedNames(accountName).includes(searchedName);
	});

	const atLimit: boolean = $derived.by(() => {
		void trackVersion;
		if (!accountName) return false;
		return !canTrackMore(accountName);
	});

	function toggleTrack(name: string) {
		if (!accountName) return;
		if (getTrackedNames(accountName).includes(name)) {
			removeTrackedName(accountName, name);
		} else {
			if (!addTrackedName(accountName, name)) return;
		}
		trackVersion++;
		ontrackchange?.();
	}

	const namePattern = /^[a-z1-5]{1,11}$/;

	function validate(value: string): boolean {
		if (!value) {
			validationError = '';
			return false;
		}
		if (value.includes('.')) {
			validationError = 'Premium names cannot contain dots';
			return false;
		}
		if (value.length > 11) {
			validationError = 'Premium names must be 11 characters or fewer';
			return false;
		}
		if (!namePattern.test(value)) {
			validationError = 'Only lowercase a-z and digits 1-5 are allowed';
			return false;
		}
		validationError = '';
		return true;
	}

	const symbol = $derived(network.config.systemtoken.id.symbol);

	async function search() {
		const name = query.trim().toLowerCase();
		if (!validate(name)) return;

		searching = true;
		result = null;
		accountExists = false;
		searchError = '';

		try {
			const params = new URLSearchParams({ search: name });
			const res = await fetch(urlPath(`/api/bidname?${params}`));
			if (!res.ok) throw new Error(`Search failed: ${res.status}`);
			const data: BidnameApiResponse = await res.json();

			if (data.searchResult) {
				result = data.searchResult.bid ? Types.name_bid.from(data.searchResult.bid) : undefined;
				accountExists = data.searchResult.accountExists;
			} else {
				result = undefined;
			}
		} catch {
			result = undefined;
			searchError = 'Search failed. Please try again.';
		} finally {
			searching = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			search();
		}
	}
</script>

<Stack>
	<div class="flex gap-2">
		<input
			type="text"
			bind:value={query}
			onkeydown={handleKeydown}
			placeholder="Search premium names..."
			class="bg-surface-container border-outline-variant text-on-surface placeholder:text-muted focus:ring-primary flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
		/>
		<Button variant="primary" onclick={search} disabled={searching || !query.trim()}>Search</Button>
	</div>

	{#if validationError}
		<p class="text-error text-sm">{validationError}</p>
	{/if}

	{#if searchError}
		<p class="text-error text-sm">{searchError}</p>
	{/if}

	{#if searching}
		<p class="text-muted text-sm">Searching...</p>
	{:else if result !== null}
		{#if accountExists && !result}
			<div class="bg-surface-container-high rounded-lg p-4">
				<p class="text-on-surface font-medium">This name is already taken</p>
				<p class="text-muted text-sm">
					The account "{query.trim().toLowerCase()}" already exists on the network.
				</p>
			</div>
		{:else if result}
			{@const bid = result}
			<div class="bg-surface-container-high rounded-lg p-4">
				<Stack class="gap-2">
					<div class="flex items-center justify-between">
						<h4 class="text-on-surface text-lg font-bold">{String(bid.newname)}</h4>
						<span class="text-muted text-xs">
							{formatRelativeTime(bid.last_bid_time.toMilliseconds())}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<p class="text-on-surface text-sm">
							<span class="text-muted">Current bid:</span>
							{formatBidAmount(bid.high_bid, symbol)}
						</p>
						<p class="text-sm">
							<span class="text-muted">High bidder:</span>
							<AccountLink name={bid.high_bidder} />
						</p>
					</div>
					<div class="flex flex-wrap gap-2">
						<Button href={urlPath(`/bidname/bid?name=${String(bid.newname)}`)} variant="primary">
							Place Bid
						</Button>
						{#if accountName}
							<Button
								variant="secondary"
								onclick={() => toggleTrack(String(bid.newname))}
								disabled={!tracked && atLimit}
							>
								{tracked ? 'Untrack' : atLimit ? 'Limit Reached' : 'Track'}
							</Button>
						{/if}
					</div>
				</Stack>
			</div>
		{:else if !accountExists}
			<div class="bg-surface-container-high rounded-lg p-4">
				<Stack class="gap-2">
					<p class="text-on-surface font-medium">No bids yet - be the first!</p>
					<p class="text-muted text-sm">
						No one has placed a bid on "{searchedName}" yet.
					</p>
					<div class="flex flex-wrap gap-2">
						<Button href={urlPath(`/bidname/bid?name=${searchedName}`)} variant="primary">
							Start Bidding
						</Button>
						{#if accountName}
							<Button
								variant="secondary"
								onclick={() => toggleTrack(searchedName)}
								disabled={!tracked && atLimit}
							>
								{tracked ? 'Untrack' : atLimit ? 'Limit Reached' : 'Track'}
							</Button>
						{/if}
					</div>
				</Stack>
			</div>
		{/if}
	{/if}
</Stack>
