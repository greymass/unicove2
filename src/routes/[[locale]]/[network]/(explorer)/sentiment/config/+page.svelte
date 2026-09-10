<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import {
		Stack,
		NameInput,
		SymbolInput,
		AssetInput,
		Button,
		Label
	} from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let systemContract: Name = $state(data.config?.system_contract ?? Name.from(''));
	let systemContractValid = $state(false);
	let tokenContract: Name = $state(data.config?.fees.token.contract ?? Name.from(''));
	let tokenContractValid = $state(false);
	let tokenAction: Name = $state(data.config?.fees.action ?? Name.from('transfer'));
	let tokenActionValid = $state(false);
	let tokenSymbol: Asset.Symbol = $state(
		data.config?.fees.token.symbol ?? Asset.Symbol.from('4,EOS')
	);
	let tokenSymbolValid = $state(false);
	let feeReceiver: Name = $state(data.config?.fees.receiver ?? Name.from(''));
	let feeReceiverValid = $state(false);
	let createtopicFee: Asset = $state(data.config?.fees.createtopic ?? Asset.fromUnits(0, '4,EOS'));
	let createtopicFeeValid = $state(false);

	let error = $state('');
	let txid = $state('');

	const canSubmit = $derived(
		systemContractValid &&
			tokenContractValid &&
			tokenActionValid &&
			tokenSymbolValid &&
			feeReceiverValid &&
			!!context.wharf.session &&
			!context.wharf.transacting
	);

	async function submit() {
		try {
			if (!context.wharf.session) return;

			const action = context.network.contracts.sentiment.action('setconfig', {
				system_contract: systemContract,
				token_contract: tokenContract,
				token_action: tokenAction,
				token_symbol: tokenSymbol,
				fee_receiver: feeReceiver,
				createtopic_fee: createtopicFee
			});

			const result = await context.wharf.transact({ action });
			txid = String(result?.response?.transaction_id);
			if (!txid) {
				error = 'no txid';
			}
		} catch (e) {
			error = String(e);
		}
	}

	function reset() {
		error = '';
		txid = '';
	}
</script>

<Stack>
	{#if txid}
		<TransactSummary transactionId={txid} />
		<Button onclick={reset} variant="secondary">Back to Config</Button>
	{:else if error}
		<TransactError {error} />
		<Button onclick={reset}>Try Again</Button>
	{:else}
		<Stack class="gap-4">
			<div class="bg-surface-container-high space-y-4 rounded-xl p-4">
				<fieldset class="grid gap-2">
					<Label for="system-contract">System Contract</Label>
					<NameInput
						bind:value={systemContract}
						bind:valid={systemContractValid}
						id="system-contract"
						placeholder="e.g. eosio"
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="token-contract">Token Contract</Label>
					<NameInput
						bind:value={tokenContract}
						bind:valid={tokenContractValid}
						id="token-contract"
						placeholder="e.g. eosio.token"
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="token-action">Token Action</Label>
					<NameInput
						bind:value={tokenAction}
						bind:valid={tokenActionValid}
						id="token-action"
						placeholder="e.g. transfer"
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="token-symbol">Token Symbol</Label>
					<SymbolInput
						bind:value={tokenSymbol}
						bind:valid={tokenSymbolValid}
						id="token-symbol"
						placeholder="e.g. 4,EOS"
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="fee-receiver">Fee Receiver</Label>
					<NameInput
						bind:value={feeReceiver}
						bind:valid={feeReceiverValid}
						id="fee-receiver"
						placeholder="e.g. sentiment.gm"
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="createtopic-fee">Create Topic Fee</Label>
					<AssetInput
						bind:value={createtopicFee}
						bind:valid={createtopicFeeValid}
						id="createtopic-fee"
					/>
				</fieldset>
			</div>

			{#if !context.wharf.session}
				<p class="text-on-surface-variant text-center text-sm">Please log in to update config</p>
			{/if}

			<Button disabled={!canSubmit} onclick={submit} variant="primary">Set Config</Button>
		</Stack>
	{/if}
</Stack>
