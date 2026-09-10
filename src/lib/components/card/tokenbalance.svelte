<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { Info } from '@lucide/svelte';

	import AssetText from '$lib/components/elements/asset.svelte';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import {
		TokenBalance,
		tokenEquals,
		TokenHistoricPrice,
		ZeroUnits,
		type TokenPair
	} from '$lib/types/token';
	import { Button } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Code } from '@wharfkit/svelte-components';
	import Link from '$lib/components/elements/link.svelte';
	import { Details } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	interface CTA {
		text: string;
		href: string;
		variant?: 'primary' | 'secondary' | 'text' | 'pill';
		visible: boolean;
	}

	interface TokenOverviewProps {
		balance: TokenBalance;
		class?: string;
		child?: string;
		cta?: CTA[];
		debug?: boolean;
		isCurrentUser: boolean;
		open?: boolean;
		network: NetworkState;
		historic?: TokenHistoricPrice;
		historicTimeframe?: string;
		pair?: TokenPair;
		value: Asset;
	}

	let {
		balance: _balance,
		class: className = 'break-after-avoid',
		child,
		cta,
		debug = false,
		isCurrentUser,
		network,
		open = $bindable(false),
		historic,
		historicTimeframe,
		pair,
		value
	}: TokenOverviewProps = $props();

	const balance = $derived(child ? _balance.child(child) : _balance);
	const isRamToken = $derived(tokenEquals(_balance.token.id, network.getRamToken().id));
	const hasValue = $derived(network.supports('delphioracle') || context.settings.data.mockPrice);
	const balanceRefunding = $derived(_balance.child('refunding'));
	const balanceStaked = $derived(_balance.child('staked'));
	const balanceUnstaked = $derived(_balance.child('unstaked'));
	const balanceDelegated = $derived(_balance.child('delegated'));
	const balanceUsed = $derived(_balance.child('used'));
	const balanceWRAM = $derived(_balance.child('wram'));
	const balanceGifted = $derived(_balance.child('gifted'));
</script>

{#snippet SubBalance(label: string, value: Asset, action?: { text: string; href: string })}
	<div class="col-span-full grid h-10 grid-cols-subgrid items-center gap-x-4">
		<div class="flex flex-col gap-1">
			{label}
		</div>
		<div class="flex flex-1 flex-col gap-1 text-right text-nowrap">
			<AssetText {value} />
		</div>
		<div class="flex flex-col gap-1 text-nowrap">
			{#if action && isCurrentUser}
				<Button variant="text" href={action.href} class="self-start">
					{action.text}
				</Button>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet DetailsHeader()}
	<!-- Left -->
	<div class="left flex flex-col justify-center gap-2">
		<h4
			class="text-on-surface inline-flex items-center gap-2 text-xl leading-none font-bold capitalize"
		>
			<img
				class="size-6 object-contain"
				alt="{_balance.token.name} Logo"
				src={_balance.token.media?.logo?.light}
			/>
			{#if isRamToken}
				<Link class="text-on-surface" href={urlPath('/ram')}>
					{balance.token.name} (RAM)
				</Link>
			{:else}
				<Link
					class="text-on-surface"
					href={urlPath(`/token/${balance.token.contract}/${balance.token.name}`)}
				>
					{balance.token.name}
					<Info class="text-muted size-4" />
				</Link>
			{/if}
		</h4>

		{#if pair && hasValue}
			{#if pair.price.units.gt(ZeroUnits)}
				<TradingPair class="leading-none" {historic} {historicTimeframe} value={pair} />
			{:else}
				<div class="bg-surface-container-high h-4 w-32 animate-pulse rounded">&nbsp;</div>
			{/if}
		{/if}
	</div>

	<!-- Right -->
	<div class="right text-muted flex flex-col justify-between gap-2">
		<div class="h-6 w-full content-center">
			<h4 class="text-on-surface text-right text-xl leading-none font-bold capitalize">
				<AssetText value={balance.balance} />
			</h4>
		</div>

		{#if pair && hasValue}
			{#if value.units.gt(ZeroUnits)}
				<AssetText class="leading-none" variant="full" {value} />
			{:else}
				<div class="bg-surface-container-high max-w-48 animate-pulse rounded-md">&nbsp;</div>
			{/if}
		{/if}
	</div>
{/snippet}

<Details class={className} header={DetailsHeader} {open}>
	{@render SubBalance(
		isRamToken ? 'Tradable' : 'Available',
		_balance.balance,
		!_balance.locked
			? {
					text: 'Send',
					href: urlPath(`/send/${balance.token.id.url}`)
				}
			: undefined
	)}

	{#if tokenEquals(balance.token.id, network.token.id)}
		{#if network.supports('staking') && balanceStaked}
			{@render SubBalance('Staked', balanceStaked.balance, {
				text: 'Staking',
				href: urlPath(`/staking`)
			})}
		{/if}

		{#if balanceUnstaked && balanceUnstaked.balance.value > 0}
			{@render SubBalance('Unstaked', balanceUnstaked.balance, {
				text: 'Withdraw',
				href: urlPath(`/staking/withdraw`)
			})}
		{/if}

		{#if balanceDelegated && balanceDelegated.balance.value > 0}
			{@render SubBalance('Delegated', balanceDelegated.balance, {
				text: 'Reclaim',
				href: urlPath(`/undelegate`)
			})}
		{/if}

		{#if balanceRefunding && balanceRefunding.balance.value > 0}
			{@render SubBalance('Refunding', balanceRefunding.balance, {
				text: 'Claim',
				href: urlPath(`/refund`)
			})}
		{/if}
	{/if}

	{#if balanceUsed && balanceUsed.balance.value > 0}
		{@render SubBalance('Used', balanceUsed.balance)}
	{/if}

	{#if isRamToken && balanceGifted && balanceGifted.balance.value > 0}
		{@render SubBalance('Gifted (untransferable)', balanceGifted.balance)}
	{/if}

	{#if isRamToken && balanceWRAM}
		{@render SubBalance('WRAM', balanceWRAM.balance, {
			text: 'Swap',
			href: urlPath(`/swap/${balanceWRAM.token.id.url}/${network.getRamToken().id.url}`)
		})}
	{/if}

	{#if cta && cta.length}
		<div class="col-span-full flex gap-6">
			{#each cta as action}
				<Button
					class="mt-4 {action.visible ? '' : 'hidden'}"
					variant={action.variant || 'secondary'}
					href={action.href}
				>
					{action.text}
				</Button>
			{/each}
		</div>
	{/if}
</Details>

{#if debug}
	<Code json={_balance} />
{/if}
