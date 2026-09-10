<script lang="ts">
	import { Checksum256, Int64 } from '@wharfkit/antelope';
	import { type TransactResult } from '@wharfkit/session';
	import { getContext } from 'svelte';

	import { Stack, Table, TD, TR } from '@wharfkit/svelte-components';
	import { NumberInput } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';
	import { NameInput } from '@wharfkit/svelte-components';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Checkbox } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import CpuAndNetResource from '$lib/components/elements/cpunetresource.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import type { AccountState } from '$lib/state/client/account.svelte';

	import { preventDefault } from '$lib/utils';
	import { RentState } from './state.svelte';
	import { type RentType } from './utils';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		rentType: RentType;
		network: NetworkState;
		account?: AccountState;
	}

	const { rentType, network, account }: Props = $props();

	const cpuAvailableSize = $derived(context.account?.resources.cpu.available || Int64.from(0));
	const netAvailableSize = $derived(context.account?.resources.net.available || Int64.from(0));
	const usableTime = $derived.by(() => {
		if (rentType === 'POWERUP') return '24 Hours';
		if (rentType === 'REX') return '30 Days';
		return 'Until Unstaked';
	});

	$effect(() => {
		if (account && network) {
			if (account.name) {
				rentState.payer = account.name;
			}

			switch (rentType) {
				case 'POWERUP': {
					try {
						const fracs = network.getPowerupFrac(
							Number(rentState.cpuAmount || 0),
							Number(rentState.netAmount || 0)
						);
						rentState.cpuFrac = fracs[0];
						rentState.netFrac = fracs[1];
						rentState.cpuPricePerMs = network.resources.cpu.price.powerup;
						rentState.netPricePerKb = network.resources.net.price.powerup;
					} catch (e) {
						console.warn('Error calculating powerup prices:', e);
					}
					break;
				}
				case 'REX': {
					rentState.cpuPricePerMs = network.resources.cpu.price.rex;
					rentState.netPricePerKb = network.resources.net.price.rex;
					break;
				}
				default: {
					break;
				}
			}

			if (account.balance) rentState.balance = account.balance.balance;
		} else {
			rentState.reset();
		}
	});

	let cpuAmountInput: NumberInput | undefined = $state();
	let netAmountInput: NumberInput | undefined = $state();
	let receiverNameInput: NameInput | undefined = $state();

	const rentState: RentState = $state(new RentState(network.chain, rentType));
	const rentDetails = $derived.by(() => {
		const details = [];
		details.push({ title: 'Usable for', desc: usableTime });
		details.push({
			title: 'Balance available',
			desc: `${rentState.balance.quantity} ${rentState.balance.symbol.name}`
		});
		details.push({
			title: 'Total Cost',
			desc: `${rentState.cost.quantity} ${rentState.cost.symbol.name}`
		});
		return details;
	});

	let transactionId: Checksum256 | undefined = $state();
	let errorMessage: string | undefined = $state();

	function handleRent() {
		errorMessage = undefined;
		if (!context.wharf || !context.wharf.session || !context.network) {
			alert('Not logged in');
			return;
		}

		const actions = rentState.getActions(network.contracts.system);
		context.wharf
			.transact({
				actions: actions
			})
			.then((result: TransactResult) => {
				transactionId = result.response?.transaction_id;
			})
			.catch((error) => {
				errorMessage = error;
				console.error(error);
			});
	}

	function resetStateAfterTrasaction() {
		transactionId = undefined;
		errorMessage = undefined;
		rentState.resetAfterTransction();
		cpuAmountInput?.set();
		netAmountInput?.set();
	}
</script>

{#if transactionId}
	<TransactSummary {transactionId} />
	<Button href={context.urlPath('/resources')} variant="secondary">Resources</Button>
	<Button href={context.urlPath(`/account/${context.account?.name}`)}>View my account</Button>
{:else if errorMessage}
	<TransactError error={errorMessage} />
	<Button onclick={resetStateAfterTrasaction}>Close</Button>
{:else}
	<div class="mx-auto space-y-6">
		<CpuAndNetResource cpuAvailable={cpuAvailableSize} netAvailable={netAvailableSize} />
		<form onsubmit={preventDefault(handleRent)}>
			<Stack>
				<fieldset class="grid gap-2">
					<Label for="cpuNumberInput"
						>Amount of CPU
						{#if rentState.cpuPricePerMs}
							(<AssetText variant="full" value={rentState.cpuPricePerMs} />/MS){/if}</Label
					>
					<NumberInput
						bind:this={cpuAmountInput}
						id="cpuNumberInput"
						unit="ms"
						bind:value={rentState.cpuAmount}
						placeholder="0"
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="netNumberInput"
						>Amount of NET
						{#if rentState.netPricePerKb}
							(<AssetText variant="full" value={rentState.netPricePerKb} />/KB){/if}</Label
					>
					<NumberInput
						bind:this={netAmountInput}
						id="netNumberInput"
						unit="kb"
						bind:value={rentState.netAmount}
						placeholder="0"
					/>
				</fieldset>

				<fieldset class="flex items-center gap-3">
					<Checkbox id="rentForSelf" bind:checked={rentState.rentingForSelf} />
					<Label for="rentForSelf">Rent Resources for my account</Label>
				</fieldset>

				{#if !rentState.rentingForSelf}
					<fieldset class="semi-bold grid gap-2">
						<Label for="thirdReceiver">Receiving Account</Label>
						<NameInput
							id="thirdReceiver"
							bind:this={receiverNameInput}
							bind:value={rentState.thirdReceiver}
							bind:valid={rentState.thirdReceiverValid}
							placeholder="Enter the account name"
						/>
					</fieldset>
				{/if}

				{#if rentState.insufficientBalance}
					<p class="text-error">Insufficient balance. Please enter a smaller amount.</p>
				{/if}
				<Button type="submit" class="w-full" disabled={!rentState.valid}>
					{#if rentState.cost.value}
						Rent for {rentState.cost}
					{:else}
						Confirm Rent
					{/if}
				</Button>
			</Stack>
		</form>

		<DL>
			{#each rentDetails as detail}
				<DLRow title={detail.title}>
					<DD>{detail.desc}</DD>
				</DLRow>
			{/each}
		</DL>
	</div>
{/if}

{#if context.settings.data.debugMode}
	<div class="border-primary mx-auto mt-6 max-w-md border-2 p-6">
		<h3 class="text-title text-center">Debug Info</h3>
		<Table full>
			{#each rentState.getDebugInfo() as item}
				<TR>
					<TD>{item[0]}</TD>
					<TD>{item[1]}</TD>
				</TR>
			{/each}
		</Table>
	</div>
{/if}
