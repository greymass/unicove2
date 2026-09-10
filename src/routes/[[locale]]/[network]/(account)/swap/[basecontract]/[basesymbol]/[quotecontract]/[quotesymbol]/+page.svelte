<script lang="ts">
	import { Asset, Checksum256, type AnyAction } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	import { Code } from '@wharfkit/svelte-components';
	import { AssetInput } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { IconButton } from '@wharfkit/svelte-components';
	import TransactForm from '$lib/components/transact/form.svelte';

	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte.js';
	import { TokenBalance, TokenSwap, ZeroUnits } from '$lib/types/token.js';
	import { ArrowRight, ArrowRightLeft } from '@lucide/svelte';
	import { Label } from '@wharfkit/svelte-components';
	import { SingleCard } from '$lib/components/layout';
	import { Stack } from '@wharfkit/svelte-components';
	import { deriveSwapAction } from '../../../../swap.js';
	import { Switcher } from '@wharfkit/svelte-components';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	const baseDefaultAsset = $derived(Asset.fromUnits(0, data.base.symbol));
	const baseDefault = $derived(TokenBalance.from({ token: data.base, balance: baseDefaultAsset }));
	const quoteDefaultAsset = $derived(Asset.fromUnits(0, data.quote.symbol));
	const quoteDefault = $derived(
		TokenBalance.from({ token: data.quote, balance: quoteDefaultAsset })
	);

	let baseInput: AssetInput | undefined = $state();
	let baseQuantity = $derived(Asset.from(baseDefaultAsset));
	let baseBalance: TokenBalance = $derived(
		context.account ? context.account.getBalance(data.base) : baseDefault
	);

	let quoteInput: AssetInput | undefined = $state();
	let quoteQuantity = $derived(Asset.from(quoteDefaultAsset));
	let quoteBalance: TokenBalance = $derived(
		context.account ? context.account.getBalance(data.quote) : quoteDefault
	);

	const swap = $derived.by(() => market.market.getSwap(data.base.id, data.quote.id));
	const reversible = $derived(swap && swap.reversible);

	const feeAppliedTo = $derived(
		swap && swap.fee && swap.fee.token.symbol.equals(baseQuantity.symbol)
			? baseQuantity
			: quoteQuantity
	);

	const fee = $derived.by(() => {
		let amount = Asset.fromUnits(0, feeAppliedTo.symbol);
		if (swap && swap.fee) {
			if (swap.fee.ramfee) {
				// See: https://github.com/AntelopeIO/reference-contracts/blob/c526479a48370981a1e9f0ac6b3bb0e4f737afa2/contracts/eosio.system/src/delegate_bandwidth.cpp#L60C7-L60C47
				amount.units.add(feeAppliedTo.units.adding(199).dividing(200));
			}
		}
		return amount;
	});

	const action: AnyAction | undefined = $derived.by(() => {
		if (context.account && swap) {
			return deriveSwapAction(context.network, context.account, swap, baseQuantity);
		}
	});

	async function transact() {
		if (!swap || !swap.pair.base.contract) {
			throw new Error('No swap available for this pair');
		}
		if (!context.account) {
			throw new Error('No account');
		}
		if (!data.base.contract) {
			throw new Error('Base contract is not defined');
		}
		if (!baseBalance) {
			throw new Error('Base balance does not exist');
		}
		const { account, wharf } = context;
		if (wharf && account) {
			wharf
				.transact({
					action
				})
				.then((result) => {
					id = result?.resolved?.transaction.id;
					account.setBalance(
						TokenBalance.from({
							...baseBalance,
							balance: Asset.fromUnits(
								baseBalance.balance.units.subtracting(baseQuantity.units),
								baseBalance.balance.symbol
							)
						})
					);
					account.setBalance(
						TokenBalance.from({
							...quoteBalance,
							balance: Asset.fromUnits(
								quoteBalance.balance.units.adding(quoteQuantity.units),
								quoteBalance.balance.symbol
							)
						})
					);
				})
				.catch((e) => {
					console.error('Transaction error', e);
					error = e;
				});
		}
	}

	function flip() {
		const base = Asset.fromUnits(0, quoteQuantity.symbol);
		const quote = Asset.fromUnits(0, baseQuantity.symbol);
		baseInput?.set(base);
		baseQuantity = base;
		quoteInput?.set(quote);
		quoteQuantity = quote;
	}

	function calculateFee(swap: TokenSwap, feeAppliedTo: Asset): Asset {
		let feeAmount = Asset.fromUnits(0, feeAppliedTo.symbol);
		if (swap && swap.fee) {
			if (swap.fee.ramfee) {
				// See: https://github.com/AntelopeIO/reference-contracts/blob/c526479a48370981a1e9f0ac6b3bb0e4f737afa2/contracts/eosio.system/src/delegate_bandwidth.cpp#L60C7-L60C47
				feeAmount.units.add(feeAppliedTo.units.adding(199).dividing(200));
			}
		}

		return feeAmount;
	}

	function calculateQuote(value: string) {
		const number = Number(value);
		if (swap) {
			if (number > 0) {
				const feeAmount = calculateFee(swap, feeAppliedTo);
				const quote = Asset.fromFloat(
					(number - feeAmount.value) * swap.pair.price.value,
					quoteQuantity.symbol
				);
				quoteQuantity = quote;
				quoteInput?.set(quote);
			} else {
				quoteInput?.set(quoteDefaultAsset);
				quoteQuantity = quoteDefaultAsset;
			}
		}
	}

	function baseChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		calculateQuote(e.currentTarget.value);
	}

	function quoteChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (swap) {
			const feeAmount = calculateFee(swap, feeAppliedTo);
			const base = Asset.fromFloat(
				(Number(e.currentTarget.value) + feeAmount.value) / swap.pair.price.value,
				baseQuantity.symbol
			);
			baseQuantity = base;
			baseInput?.set(base);
		}
	}

	function onkeydown(event: Event) {
		const { key } = event as KeyboardEvent;
		if (key === 'Enter') {
			transact();
		}
	}

	function max() {
		baseInput?.set(baseBalance.balance);
		baseQuantity = baseBalance.balance;
		calculateQuote(String(baseBalance.balance.value));
	}
</script>

{#snippet Success()}
	<div class="flex gap-4">
		<Button variant="secondary" onclick={() => (id = undefined)}>Back</Button>
		<Button href={context.urlPath(`/account/${context.account?.name}`)}>View my account</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex gap-4">
		<Button onclick={() => (error = undefined)}>Back</Button>
	</div>
{/snippet}

{#snippet TokenLogo(balance: TokenBalance)}
	<picture class="size-8">
		<img
			class="size-full object-contain"
			alt="{balance.token.name} Logo"
			src={balance.token.media?.logo?.light}
		/>
	</picture>
{/snippet}

{#snippet Balances()}
	<div class="grid grid-rows-2 gap-4 sm:grid-cols-2 sm:grid-rows-1">
		<div
			class="bg-surface-container-high col-start-1 row-start-1 space-y-2 rounded-xl p-6 sm:col-span-1 sm:col-start-1"
		>
			<div class="flex items-center gap-x-2">
				{#if baseBalance.token.media?.logo?.light}
					{@render TokenLogo(baseBalance)}
				{/if}
				<h3 class="text-title">{baseBalance.balance.symbol.name}</h3>
			</div>
			<AssetText class="text-on-surface" value={baseBalance.balance} />
			<p>Available</p>
		</div>

		<div
			class="bg-surface-container z-10 col-span-full row-span-full rotate-90 place-self-center rounded-full sm:rotate-0"
		>
			{#if reversible}
				<IconButton
					icon={ArrowRightLeft}
					href={context.urlPath(`/swap/${data.quote.id.url}/${data.base.id.url}`)}
					onclick={flip}
					disabled={context.wharf.transacting}
					size="large"
				/>
			{:else}
				<IconButton icon={ArrowRight} disabled size="large" />
			{/if}
		</div>

		<div
			class="bg-surface-container-high col-start-1 row-start-2 space-y-2 rounded-xl p-6 sm:col-span-1 sm:col-start-2 sm:row-start-1"
		>
			<div class="flex items-center gap-x-2">
				{#if quoteBalance.token.media?.logo?.light}
					{@render TokenLogo(quoteBalance)}
				{/if}
				<span class="text-title">{quoteBalance.balance.symbol.name}</span>
			</div>
			<AssetText class="text-on-surface" value={quoteBalance.balance} />
			<p>Available</p>
		</div>
	</div>
{/snippet}

{#snippet BaseField()}
	<Stack class="gap-1">
		<Label
			for="base-quantity"
			class="items-baseline-last grid h-10 grid-cols-[1fr_auto] items-center"
		>
			Send {data.base.name}
			<Button variant="text" disabled={!context.account} onclick={max}>Max</Button>
		</Label>
		<AssetInput
			autofocus
			id="base-quantity"
			bind:value={baseQuantity}
			bind:this={baseInput}
			oninput={baseChange}
			{onkeydown}
			disabled={context.wharf.transacting}
		/>
	</Stack>
{/snippet}

{#snippet QuoteField()}
	<Stack class="gap-1">
		<Label
			for="base-quantity"
			class="items-baseline-last grid h-10 grid-cols-[1fr_auto] items-center"
		>
			Receive {data.quote.name}
		</Label>
		<AssetInput
			bind:value={quoteQuantity}
			bind:this={quoteInput}
			oninput={quoteChange}
			{onkeydown}
			disabled={context.wharf.transacting}
		/>
	</Stack>
{/snippet}

<SingleCard>
	<Stack>
		<TransactForm {id} {error} onsuccess={Success} onfailure={Failure}>
			{@render Balances()}

			{#if swap}
				<Switcher>
					{@render BaseField()}
					{@render QuoteField()}
				</Switcher>

				<p class="text-center text-balance">
					{#if swap.fee?.ramfee}
						Network Fee:
						<AssetText class="text-on-surface font-bold" value={fee} variant="full" />
						(0.5%)
					{/if}
				</p>

				<Button
					onclick={transact}
					disabled={context.wharf.transacting ||
						!context.account ||
						baseQuantity.units.lte(ZeroUnits)}
				>
					Swap to {String(data.quote.symbol.name)}
				</Button>
			{:else if !market.market.loaded}
				<p>Loading...</p>
			{:else}
				<p class="text-center">No swap pair available</p>
			{/if}
		</TransactForm>
	</Stack>
</SingleCard>

{#if context.settings.data.debugMode}
	<Code
		json={{
			fee,
			baseQuantity,
			quoteQuantity
		}}
	/>

	<Code
		json={{
			action,
			loaded: market.market.loaded,
			refreshed: market.market.refreshed,
			base: data.base,
			quote: data.quote,
			swap
		}}
	/>
{/if}
