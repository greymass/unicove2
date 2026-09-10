<script lang="ts">
	import { Stack, Card } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import { Chip } from '@wharfkit/svelte-components';
	import { Breakdown, BreakdownRow } from '$lib/components/breakdown';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { tokenEquals, ZeroUnits, type TokenBalance, type TokenPair } from '$lib/types/token';
	import { Button } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { urlPath } = getContext<UnicoveContext>('state');

	interface TokenOverviewProps {
		balance: TokenBalance;
		class?: string;
		cta?: {
			text: string;
			href: string;
			visible: boolean;
		};
		isCurrentUser: boolean;
		network: NetworkState;
		pair?: TokenPair;
		value: Asset;
	}

	const {
		balance,
		class: className = 'break-after-avoid',
		cta,
		isCurrentUser,
		network,
		pair,
		value
	}: TokenOverviewProps = $props();

	const balanceRefunding = $derived(balance.child('refunding'));
	const balanceStaked = $derived(balance.child('staked'));
	const balanceUnstaked = $derived(balance.child('unstaked'));
	const balanceDelegated = $derived(balance.child('delegated'));
	const balanceTotal = $derived(balance.child('total'));

	const isRamToken = $derived(tokenEquals(balance.token.id, network.getRamToken().id));
</script>

<Card id="{balance.token.contract}-{balance.token.symbol.name}-token" class={className}>
	<div class="card-title h4">
		{#if isRamToken}
			<a href={urlPath('/ram')}>
				{balance.token.symbol.name} (RAM)
			</a>
		{:else}
			<a href={urlPath(`/token/${balance.token.contract}/${balance.token.name}`)}>
				{balance.token.symbol.name}
			</a>
		{/if}
	</div>
	<Stack>
		{#if network.supports('delphioracle')}
			<div
				class="border-mine-900 col-span-full grid min-h-12 grid-cols-subgrid items-center gap-x-4"
			>
				<div
					class="col-start-1 col-end-3 row-start-1 flex flex-col py-2 @xs:flex-row @xs:justify-between"
				>
					<Stack class="gap-2">
						<h4 class="text-muted text-base leading-none">Value</h4>
						<p class="text-on-surface text-xl leading-none font-semibold">
							{#if value.units.gt(ZeroUnits)}
								<AssetText variant="full" {value} />
							{:else}
								<span class="bg-mine-900 animate-pulse rounded tabular-nums">&nbsp;</span>
							{/if}
						</p>
						{#if pair}
							<Chip>
								{#if pair.price.units.gt(ZeroUnits)}
									<TradingPair value={pair} />
								{:else}
									<span class="bg-mine-900 animate-pulse rounded tabular-nums">&nbsp;</span>
								{/if}
							</Chip>
						{/if}
					</Stack>
				</div>

				{#if network.supports('directfunding') && tokenEquals(balance.token.id, network.getSystemToken().id) && isCurrentUser}
					<div class="col-span-2 col-start-2 row-start-1 text-right @xs:col-span-1 @xs:col-start-3">
						<Button href={urlPath(`/fund`)}>Add Funds</Button>
					</div>
				{/if}
			</div>
		{/if}

		<Breakdown {isCurrentUser}>
			<BreakdownRow
				key="Available"
				value={balance.balance}
				action={!balance.locked
					? {
							text: 'Send',
							href: urlPath(`/send/${balance.token.id.url}`),
							visible: isCurrentUser
						}
					: undefined}
			/>

			{#if tokenEquals(balance.token.id, network.token.id)}
				{#if network.supports('staking')}
					<BreakdownRow
						key="Staked"
						value={balanceStaked.balance}
						action={{
							text: 'Staking',
							href: urlPath(`/staking`),
							visible: isCurrentUser
						}}
					/>
				{/if}

				{#if balanceUnstaked && balanceUnstaked.balance.value > 0}
					<BreakdownRow
						key="Unstaked"
						value={balanceUnstaked.balance}
						action={{
							text: 'Withdraw',
							href: urlPath(`/staking/withdraw`),
							visible: isCurrentUser
						}}
					/>
				{/if}

				{#if balanceDelegated && balanceDelegated.balance.value > 0}
					<BreakdownRow
						key="Delegated"
						value={balanceDelegated.balance}
						action={{
							text: 'Reclaim',
							href: urlPath(`/undelegate`),
							visible: isCurrentUser
						}}
					/>
				{/if}

				{#if balanceRefunding && balanceRefunding.balance.value > 0}
					<BreakdownRow
						key="Refunding"
						value={balanceRefunding.balance}
						action={{
							text: 'Claim',
							href: urlPath(`/refund`),
							visible: isCurrentUser
						}}
					/>
				{/if}
			{/if}

			{#if balanceTotal && balanceTotal.balance.value > 0}
				<BreakdownRow key="Total" value={balanceTotal.balance} />
			{/if}
		</Breakdown>

		{#if cta}
			<Button class="mt-4 {cta.visible ? '' : 'hidden'}" variant="secondary" href={cta.href}>
				{cta.text}
			</Button>
		{/if}
	</Stack>
</Card>
