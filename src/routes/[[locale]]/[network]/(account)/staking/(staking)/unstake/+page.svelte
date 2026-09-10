<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import { AssetInput } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import TokenCard from '$lib/components/elements/tokencard.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import { DL } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { UnstakeManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: UnstakeManager = $state(new UnstakeManager(data.network));

	let hints = $derived([
		{ title: 'Withdrawable in 21 days', description: manager.assetValue.toString() }
	]);

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	function resetState() {
		manager = new UnstakeManager(data.network);
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={context.urlPath(`/staking`)} variant="secondary">Staking overview</Button>
		<Button href={context.urlPath(`/account/${context.account?.name}`)}>View my account</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Close</Button>
	{:else}
		<TokenCard token={manager.tokenBalance} title="Staked" description="Currently staked" />
		<Stack class="gap-3">
			<Label for="assetInput">Amount to Unstake</Label>
			<AssetInput
				autofocus
				bind:this={manager.input}
				bind:min={manager.minValue}
				bind:max={manager.maxValue}
				bind:value={manager.assetValue}
				bind:valid={manager.assetValid}
				bind:validPrecision={manager.assetValidPrecision}
				bind:validMinimum={manager.assetValidMinimum}
				bind:validMaximum={manager.assetValidMaximum}
			/>
			{#if !manager.assetValid}
				{#if !manager.assetValidPrecision}
					<p class="text-error">Invalid number, too many decimal places.</p>
				{/if}
				{#if !manager.assetValidMaximum}
					<p class="text-error">Amount exceeds available balance.</p>
				{/if}
			{/if}

			<Label for="quantity-input">
				<Button
					variant="text"
					onclick={() => {
						manager.setMaxValue();
					}}
				>
					Available:
					<AssetText value={manager.unstakable} />
				</Button>
			</Label>
			<Button disabled={!manager.assetValid} onclick={() => manager.transact()} variant="primary">
				Unstake
			</Button>
		</Stack>

		<DL items={hints} />
	{/if}
</Stack>
