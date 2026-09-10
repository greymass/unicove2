<script lang="ts">
	import { getContext } from 'svelte';

	import { Button, Stack } from '@wharfkit/svelte-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Types } from '$lib/wharf/contracts/system';
	import { formatBidAmount, formatRelativeTime } from '../formatting';

	interface Props {
		bids: Types.name_bid[];
		loading: boolean;
	}

	const { bids, loading }: Props = $props();
	const { network, urlPath } = getContext<UnicoveContext>('state');

	const symbol = $derived(network.config.systemtoken.id.symbol);
</script>

{#if loading}
	<Stack>
		<p class="text-muted">Loading bids...</p>
	</Stack>
{:else if bids.length === 0}
	<Stack>
		<p class="text-muted">No active bids found.</p>
	</Stack>
{:else}
	<div class="flex flex-col">
		{#each bids as bid, i}
			<div
				class="border-outline-variant hover:bg-surface-container-high flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="flex items-center gap-3 sm:flex-1">
					<span class="text-muted w-6 text-right text-sm font-medium">{i + 1}</span>
					<div class="min-w-0 flex-1">
						<p class="text-on-surface truncate font-bold">{String(bid.newname)}</p>
						<p class="text-muted text-sm">
							<AccountLink name={bid.high_bidder} />
						</p>
					</div>
				</div>
				<div class="flex items-center justify-between gap-4 pl-9 sm:justify-end sm:pl-0">
					<div class="text-right">
						<p class="text-on-surface text-sm font-medium">
							{formatBidAmount(bid.high_bid, symbol)}
						</p>
						<p class="text-muted text-xs">
							{formatRelativeTime(bid.last_bid_time.toMilliseconds())}
						</p>
					</div>
					<Button href={urlPath(`/bidname/bid?name=${String(bid.newname)}`)} variant="text">
						Bid
					</Button>
				</div>
			</div>
		{/each}
	</div>
{/if}
