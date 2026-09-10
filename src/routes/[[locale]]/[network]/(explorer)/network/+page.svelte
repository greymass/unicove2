<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Card, DD, DL, DLRow, Stack } from '@wharfkit/svelte-components';
	import { API } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import About from '$lib/components/seo/about.svelte';
	import { StatindexClient, type NetworkStatsEntry } from '$lib/state/statindex/client';
	import {
		DEFAULT_STAT_WINDOW,
		stripIncompletePeriod,
		windowGranularity,
		windowStart,
		type StatWindow
	} from '$lib/state/statindex/utils';
	import StatsHistory from '$lib/components/chart/statshistory.svelte';
	import WindowSelect from '$lib/components/statindex/windowselect.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	let chainInfo: API.v1.GetInfoResponse | undefined = $state();

	const locale = $derived(String(data.locale ?? 'en'));

	const hasStats = $derived(data.network.supports('statindex'));
	const client = new StatindexClient(context.urlPath('/api/stats'));

	let statWindow = $state<StatWindow>(DEFAULT_STAT_WINDOW);
	let stats = $state<NetworkStatsEntry[]>([]);
	let statsFailed = $state(false);
	let requestId = 0;

	$effect(() => {
		if (!hasStats) return;
		const window = statWindow;
		const params = {
			start: windowStart(window),
			granularity: windowGranularity(window)
		};
		const id = ++requestId;
		statsFailed = false;
		client
			.getNetworkStats(params)
			.then((response) => {
				if (id !== requestId) return;
				stats = stripIncompletePeriod(response.data ?? [], window);
			})
			.catch(() => {
				if (id !== requestId) return;
				stats = [];
				statsFailed = true;
			});
	});

	const series = $derived({
		actions: stats.map((entry) => ({ date: entry.date, value: entry.actions })),
		transactions: stats.map((entry) => ({ date: entry.date, value: entry.transactions })),
		uniqueAccounts: stats.map((entry) => ({ date: entry.date, value: entry.unique_accounts })),
		newAccounts: stats.map((entry) => ({ date: entry.date, value: entry.new_accounts }))
	});

	onMount(() => {
		updateState();
		const stateInterval = setInterval(updateState, 1000);

		return () => {
			clearInterval(stateInterval);
		};
	});

	async function updateState() {
		chainInfo = await data.network.client.v1.chain.get_info();
	}
</script>

<Stack class="gap-8">
	{#if hasStats}
		<Stack class="gap-6">
			<WindowSelect bind:value={statWindow} />
			{#if statsFailed}
				<p class="text-error">Network activity charts are unavailable right now.</p>
			{:else if stats.length}
				<div class="grid gap-8 md:grid-cols-2">
					<Card title="Actions"><StatsHistory data={series.actions} label="Actions" /></Card>
					<Card title="Transactions">
						<StatsHistory data={series.transactions} label="Transactions" />
					</Card>
					<Card title="Unique accounts (approximate)">
						<StatsHistory data={series.uniqueAccounts} label="Unique accounts (approximate)" />
					</Card>
					<Card title="New accounts">
						<StatsHistory data={series.newAccounts} label="New accounts" />
					</Card>
				</div>
			{:else}
				<p class="text-muted animate-pulse">Loading network activity...</p>
			{/if}
		</Stack>
	{/if}

	{#if chainInfo}
		<div class="grid gap-8 md:grid-cols-2">
			<Card title="Chain state">
				<DL>
					<DLRow title="Head block">
						<DD class="font-mono tabular-nums">
							{Number(chainInfo.head_block_num).toLocaleString(locale)}
						</DD>
					</DLRow>
					<DLRow title="Irreversible block">
						<DD class="font-mono tabular-nums">
							{Number(chainInfo.last_irreversible_block_num).toLocaleString(locale)}
						</DD>
					</DLRow>
					<DLRow title="Reversible blocks">
						<DD class="font-mono tabular-nums">
							{Number(
								chainInfo.head_block_num.subtracting(chainInfo.last_irreversible_block_num)
							).toLocaleString(locale)}
						</DD>
					</DLRow>
					<DLRow title="Block producer">
						<DD>
							<a
								class="text-primary"
								href={context.urlPath(`/account/${chainInfo.head_block_producer}`)}
							>
								{chainInfo.head_block_producer}
							</a>
						</DD>
					</DLRow>
					<DLRow title="Head block time">
						<DD class="font-mono tabular-nums">
							{new Date(chainInfo.head_block_time.toMilliseconds()).toLocaleString(locale)}
						</DD>
					</DLRow>
				</DL>
			</Card>
			<Card title="Node">
				<DL>
					<DLRow title="Server version">
						<DD class="font-mono">{chainInfo.server_version_string}</DD>
					</DLRow>
					<DLRow title="Chain ID">
						<DD>
							<span class="font-mono text-sm break-all">{chainInfo.chain_id}</span>
						</DD>
					</DLRow>
				</DL>
			</Card>
		</div>
	{/if}
</Stack>

<About title="About the {data.network.chain.name} network">
	<p>
		{data.network.chain.name} is a public blockchain built on the Antelope protocol. Blocks are produced
		by a rotating set of elected block producers, and a block becomes irreversible once enough of them
		have confirmed it.
	</p>
	<p>
		This page reads the live state of the chain: the current head block, the last irreversible
		block, the producer signing blocks right now, and the software version the API node reports.
		Where the network publishes activity statistics, charts of actions, transactions, and account
		growth appear over selectable time windows.
	</p>
	<p>
		Unicove is a block explorer and web wallet for {data.network.chain.name}. Every account,
		transaction, block, and contract on the network can be searched from here.
	</p>
</About>
