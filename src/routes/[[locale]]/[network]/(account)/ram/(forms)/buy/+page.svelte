<script lang="ts">
	import { getContext } from 'svelte';
	import { Checksum256, Int64 } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import { Button } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import { AssetInput } from '@wharfkit/svelte-components';
	import { BytesInput } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import RamResource from '$lib/components/elements/ramresource.svelte';
	import SystemTokenSwap from '$lib/components/banner/systemTokenSwap.svelte';

	import { BuyRAMState } from './state.svelte';
	import { preventDefault } from '$lib/utils';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const buyRamState: BuyRAMState = $state(new BuyRAMState(data.network.chain));
	const ramAvailableSize = $derived(context.account?.resources.ram.available || Int64.from(0));

	let transactionId: Checksum256 | undefined = $state();
	let errorMessage: string | undefined = $state();
	let ready = $derived(buyRamState.valid && !context.wharf.transacting);

	async function handleBuyRAM() {
		errorMessage = undefined;
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		try {
			const transactionResult = await context.wharf.transact({
				action: data.network.contracts.system.action(
					buyRamState.format === 'asset' ? 'buyram' : 'buyrambytes',
					buyRamState.toJSON()
				)
			});

			transactionId = transactionResult.resolved?.transaction.id;

			resetState();
		} catch (error) {
			errorMessage = String(error);
			console.error(error);
		}
	}

	function resetState() {
		errorMessage = undefined;
		buyRamState.reset();
		bytesInput?.reset();
		assetInput?.set(null);
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				buyRamState.payer = context.account.name;
				buyRamState.receiver = context.account.name;
			}

			if (context.account.balance) {
				buyRamState.balance = context.account.balance?.balance;
			}
		}
	});

	$effect(() => {
		if (data.network.resources.ram.price.rammarket) {
			buyRamState.pricePerKB = data.network.resources.ram.price.rammarket;
		}
	});

	function setAssetAmount() {
		buyRamState.format = 'asset';
		buyRamState.bytes = buyRamState.expectedBytes;
	}

	function setBytesAmount() {
		buyRamState.format = 'bytes';
		buyRamState.tokens = buyRamState.bytesValue;
		assetInput?.set(buyRamState.bytesValue);
	}
</script>

<Stack>
	{#if transactionId}
		<TransactSummary {transactionId} />
		<Button href={context.urlPath('/ram')} variant="secondary">RAM Market</Button>
		<Button href={context.urlPath(`/account/${context.account?.name}`)}>View my account</Button>
	{:else if errorMessage}
		<TransactError error={errorMessage} />
		<Button onclick={resetState}>Close</Button>
	{:else}
		<form onsubmit={preventDefault(handleBuyRAM)} class="mx-auto max-w-2xl space-y-4">
			<RamResource class="hidden" ramAvailable={ramAvailableSize} />

			<Stack class="gap-3">
				<Label class="text-lg" for="bytesInput">Amount of RAM to buy:</Label>
				<div class="flex gap-4">
					<div class="flex-1">
						<BytesInput
							autofocus
							bind:value={buyRamState.bytes}
							bind:this={bytesInput}
							oninput={setBytesAmount}
						/>
					</div>
					<div class="flex-1">
						<AssetInput
							bind:value={buyRamState.tokens}
							bind:this={assetInput}
							oninput={setAssetAmount}
						/>
					</div>
				</div>
				{#if buyRamState.insufficientBalance}
					<p class="text-error">
						Insufficient {String(context.network.chain.systemToken?.symbol.name)} balance. Please enter
						a smaller amount.
					</p>
				{/if}
				<p class="text-right">
					Balance
					{#if context.account}
						{context.account.balance?.balance}
					{:else}
						0.0000 {data.network.chain.systemToken?.symbol.code || ''}
					{/if}
				</p>
			</Stack>

			<Button type="submit" class="mt-4 w-full" disabled={!ready}>Buy RAM</Button>

			<SystemTokenSwap account={context.account} network={data.network} />

			<Stack class="gap-3">
				<DL>
					<DLRow title={`${context.network.chain.systemToken?.symbol.name}/RAM Price (KB) `}>
						<DD>
							<AssetText variant="full" value={buyRamState.pricePerKB} />
						</DD>
					</DLRow>

					<DLRow title="RAM to be bought">
						<DD>
							<AssetText variant="full" value={buyRamState.kbs} />
						</DD>
					</DLRow>

					<DLRow title="RAM Purchase Value">
						<DD>
							<AssetText variant="full" value={buyRamState.bytesValue} />
						</DD>
					</DLRow>

					<DLRow title="Network Fees (0.5%)">
						<DD>
							<AssetText variant="full" value={buyRamState.fee} />
						</DD>
					</DLRow>

					<DLRow title="Total Cost">
						<DD>
							<AssetText variant="full" value={buyRamState.bytesCost} />
						</DD>
					</DLRow>
				</DL>
			</Stack>
		</form>
	{/if}
	{#if context.settings.data.debugMode}
		<h3 class="text-title">Debugging</h3>
		<Code
			>{JSON.stringify(
				{
					payer: buyRamState.payer,
					receiver: buyRamState.receiver,
					bytes: buyRamState.bytes,
					balance: buyRamState.balance,
					chain: buyRamState.chain,
					pricePerKB: buyRamState.pricePerKB,
					pricePerByte: buyRamState.pricePerByte,
					bytesValue: buyRamState.bytesValue,
					valid: buyRamState.valid,
					insufficientBalance: buyRamState.insufficientBalance,
					balances: context.account?.balances
				},
				undefined,
				2
			)}</Code
		>
	{/if}
</Stack>
