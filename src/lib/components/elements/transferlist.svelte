<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Asset, Name } from '@wharfkit/antelope';
	import { ArrowRightIcon } from '@lucide/svelte';

	import { TransfersPaginator } from '../../../routes/[[locale]]/[network]/(explorer)/account/[name]/transfers.svelte.js';
	import type { NetworkState } from '$lib/state/network.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import { formatDateTime } from '$lib/utils/intl';

	interface Props {
		network: NetworkState;
		account: string;
		contract: string;
		limit?: number;
	}

	const { network, account, contract, limit = 5 }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;
	const locale = $derived(context.settings.data.locale);

	let paginator: TransfersPaginator | undefined = $state();

	onMount(() => {
		paginator = new TransfersPaginator(String(network), network.fetch, contract);
		paginator.setAccount(account);
		paginator.setLimit(limit);
		paginator.load();
	});

	const transfers = $derived(paginator?.page.results ?? []);
	const isLoading = $derived(paginator?.page.isLoading && !transfers.length);
	const perspectiveOf = $derived(Name.from(account));
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-2">
		<div class="text-on-surface-variant text-sm">Loading transfers...</div>
	</div>
{:else if transfers.length === 0}
	<div class="text-on-surface-variant py-2 text-center text-sm">No transfers found</div>
{:else}
	<div class="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1.5 text-sm">
		{#each transfers as transfer}
			{@const data = transfer.trace.act.data as {
				from: string;
				to: string;
				quantity: string;
				memo?: string;
			}}
			{@const isSend = perspectiveOf.equals(data.from)}
			{@const counterparty = isSend ? data.to : data.from}
			{@const datetime = transfer.trace.block_time.toDate()}

			<div class="flex justify-end whitespace-nowrap tabular-nums">
				<Transaction id={transfer.trace.trx_id}>
					{formatDateTime(datetime, locale, { dateStyle: 'short', timeStyle: 'short' })}
				</Transaction>
			</div>

			<div class="text-on-surface-variant truncate">
				<AccountLink name={Name.from(counterparty)} />
			</div>

			<div class="text-right font-mono tabular-nums {isSend ? 'text-error' : 'text-success'}">
				<span class="font-medium">{isSend ? '-' : '+'}</span>
				<AssetElement value={Asset.from(data.quantity)} variant="full" />
			</div>
		{/each}
	</div>

	<a
		href={urlPath(`/account/${account}/transfers?contract=${contract}`)}
		class="text-primary hover:text-primary/80 mt-2 flex items-center justify-center gap-1 text-sm font-medium"
	>
		View all transfers
		<ArrowRightIcon size={14} />
	</a>
{/if}
