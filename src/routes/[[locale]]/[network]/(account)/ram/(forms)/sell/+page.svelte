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

	import { SellRAMState } from './state.svelte';
	import { preventDefault } from '$lib/utils';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';

	let bytesInput: BytesInput | undefined = $state();
	let assetInput: AssetInput | undefined = $state();

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const sellRamState: SellRAMState = $state(new SellRAMState(data.network.chain));
	const ramAvailableSize = $derived(context.account?.resources.ram.balance || Int64.from(0));

	let transactionId: Checksum256 | undefined = $state();
	let errorMessage: string | undefined = $state();
	let ready = $derived(sellRamState.valid && !context.wharf.transacting);

	async function handleSellRAM() {
		if (!context.wharf || !context.wharf.session) {
			alert('Not logged in');
			return;
		}

		return context.wharf
			.transact({
				action: data.network.contracts.system.action('sellram', sellRamState.toJSON())
			})
			.then((transactionResult) => {
				transactionId = transactionResult.resolved?.transaction.id;
				resetState();
			})
			.catch((error) => {
				errorMessage = error;
				console.error(error);
			});
	}

	function resetState() {
		errorMessage = undefined;
		sellRamState.reset();
		bytesInput?.reset();
		assetInput?.set(null);
	}

	$effect(() => {
		if (context.account) {
			if (context.account.name) {
				sellRamState.account = context.account.name;
			}
			sellRamState.max = Number(context.account.resources.ram.balance || 0);
		}
	});

	$effect(() => {
		if (data.network.resources.ram.price.rammarket) {
			sellRamState.pricePerKB = data.network.resources.ram.price.rammarket;
		}
	});

	function setAssetAmount() {
		sellRamState.format = 'asset';
		sellRamState.bytes = sellRamState.bytesToSell;
	}

	function setBytesAmount() {
		sellRamState.format = 'bytes';
		sellRamState.tokens = sellRamState.bytesValue;
		assetInput?.set(sellRamState.bytesValue);
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
		<form onsubmit={preventDefault(handleSellRAM)} class="mx-auto max-w-2xl space-y-4">
			<RamResource class="hidden" ramAvailable={ramAvailableSize} />

			<Stack class="gap-3">
				<Label class="text-lg" for="bytesInput">Amount of RAM to sell:</Label>
				<div class="flex gap-4">
					<div class="flex-1">
						<BytesInput
							autofocus
							bind:value={sellRamState.bytes}
							bind:this={bytesInput}
							oninput={setBytesAmount}
						/>
					</div>
					<div class="flex-1">
						<AssetInput
							bind:value={sellRamState.tokens}
							bind:this={assetInput}
							oninput={setAssetAmount}
						/>
					</div>
				</div>
				{#if sellRamState.insufficientRAM}
					<p class="text-error">Insufficient RAM balance. Please enter a smaller amount.</p>
				{/if}
				<p>
					RAM Available
					{#if context.account}
						{sellRamState.maxInKBs}
					{:else}
						0 KB
					{/if}
				</p>
			</Stack>

			<Button type="submit" class="mt-4 w-full" disabled={!ready}>Sell RAM</Button>

			<Stack class="gap-3">
				<DL>
					<DLRow title={` ${context.network.chain.systemToken?.symbol.name}/RAM Price (KB) `}>
						<DD>
							<AssetText variant="full" value={sellRamState.pricePerKB} />
						</DD>
					</DLRow>

					<DLRow title="RAM to be sold">
						<DD>
							<AssetText variant="full" value={sellRamState.kbsToSell} />
						</DD>
					</DLRow>

					<DLRow title="Total Proceeds">
						<DD>
							<AssetText variant="full" value={sellRamState.bytesValue} />
						</DD>
					</DLRow>

					<DLRow title="Network Fees (0.5%)">
						<DD>
							<AssetText variant="full" value={sellRamState.fee} />
						</DD>
					</DLRow>

					<DLRow title="Expected to receive">
						<DD>
							<AssetText variant="full" value={sellRamState.expectedToReceive} />
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
					account: sellRamState.account,
					bytes: sellRamState.bytes,
					max: sellRamState.max,
					chain: sellRamState.chain,
					pricePerKB: sellRamState.pricePerKB,
					bytesValue: sellRamState.bytesValue,
					insufficientRAM: sellRamState.insufficientRAM,
					valid: sellRamState.valid,
					balances: context.account?.balances
				},
				undefined,
				2
			)}</Code
		>
	{/if}
</Stack>
