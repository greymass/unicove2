<script lang="ts">
	import { Action, Asset } from '@wharfkit/antelope';
	import { Checksum256 } from '@wharfkit/antelope';
	import { PlaceholderAuth } from '@wharfkit/session';
	import { getContext, onMount, tick, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { FiniteStateMachine } from 'runed';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { tokenEquals, type TokenBalance } from '$lib/types/token';
	import { Types as RAMTypes } from '$lib/types/ram';

	import { SingleCard } from '$lib/components/layout';
	import { Stack } from '@wharfkit/svelte-components';
	import { AssetInput } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';
	import { NameInput } from '@wharfkit/svelte-components';
	import Progress from '$lib/components/progress.svelte';
	import SummarySend from '$lib/components/summary/eosio.token/transfer.svelte';
	import { TextInput } from '@wharfkit/svelte-components';
	import TokenSelect from '$lib/components/select/balance.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import ActionSummaryContainer from '$lib/components/summary/components/container.svelte';

	import { formatCurrency } from '$lib/i18n';
	import { preventDefault } from '$lib/utils';

	import { defaultBalance, SendState } from '../../state.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const sendState: SendState = $state(new SendState());

	let quantityInput: AssetInput | undefined = $state();
	let toInput: NameInput | undefined = $state();
	let tokenSelect: TokenSelect | undefined = $state();

	let quantityRef: HTMLInputElement | undefined = $state();
	let toRef: HTMLInputElement | undefined = $state();
	let memoRef: HTMLInputElement | undefined = $state();

	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	// Show all fields, useful for development
	let showAll = $state(false);

	function transact() {
		if (!context.wharf || !context.wharf.session) {
			return;
		}
		error = undefined;
		const balance = context.account?.balances.find((b) =>
			b.token.symbol.equals(sendState.quantity.symbol)
		);
		if (balance) {
			let action = data.network.contracts.token.action('transfer', sendState.toJSON());
			// Override to allow RAM transfers
			if (tokenEquals(balance.token.id, data.network.getRamToken().id)) {
				action = Action.from({
					account: 'eosio',
					name: 'ramtransfer',
					authorization: [PlaceholderAuth],
					data: RAMTypes.ramtransfer.from({
						...sendState.toJSON(),
						bytes: sendState.quantity.units
					})
				});
			}
			if (
				balance.token.contract &&
				!balance.token.contract.equals(data.network.contracts.token.account)
			) {
				action.account = balance.token.contract;
			}
			context.wharf
				.transact({ action })
				.then((result) => {
					id = result?.resolved?.transaction.id;
					f.send('success');
				})
				.catch((e) => {
					console.error('Transaction error', e);
					error = e;
					f.send('error');
				});
		} else {
			alert('Not logged in');
		}
	}

	function max() {
		if (sendState.balance) {
			quantityInput?.set(sendState.balance.balance);
		}
	}

	$effect(() => {
		const to = page.url.searchParams.get('to');
		if (quantityRef && to && !String(sendState.to)) {
			toInput?.set(to);
			quantityRef?.focus();
			tick().then(() => f.send('next'));
		}
	});

	onMount(() => {
		if (!sendState.quantity.symbol.equals(data.symbol)) {
			quantityInput?.set(Asset.fromUnits(0, data.symbol));
		}
	});

	// Effect to handle needed state changes when setting the account
	$effect(() => {
		if (context.account) {
			const { balances, name } = context.account;
			untrack(() => {
				// Has account changed?
				if (name && sendState.from !== name) {
					// Change the from field on the transfer
					sendState.from = name;
					// Reset balance
					sendState.setBalance(defaultBalance);
					quantityInput?.set(sendState.quantity);
					f.send('reset');
				}
				// Change the balance field on the transfer
				const { token } = data;
				if (context.account) {
					const currentToken = sendState.balance.token;
					const isDefault = sendState.balance.equals(defaultBalance);
					if (isDefault) {
						const balance =
							balances.find((b) => tokenEquals(b.token.id, token.id)) ||
							(data.network.legacy &&
								balances.find((b) => tokenEquals(b.token.id, data.network.legacy!.id)));
						if (balance) {
							tokenSelect?.set(balance);
							sendState.setBalance(balance);
							quantityInput?.set(sendState.quantity);
						}
					} else {
						const updatedBalance = balances.find((b) => tokenEquals(b.token.id, currentToken.id));
						if (updatedBalance) {
							sendState.balance = updatedBalance;
						}
					}
				}
			});
		}
	});

	// The state which the submit form can exist in
	type FormStates = 'to' | 'quantity' | 'memo' | 'complete' | 'error';

	// The events which can modify state
	type FormEvents = 'next' | 'previous' | 'reset' | 'success' | 'error';

	const f = new FiniteStateMachine<FormStates, FormEvents>('to', {
		to: {
			next: () => (toValid ? 'quantity' : 'to'),
			reset,
			_enter: () => tick().then(() => toRef?.focus())
		},
		quantity: {
			previous: 'to',
			next: () => (assetValid ? 'memo' : 'quantity'),
			reset,
			_enter: () => tick().then(() => quantityRef?.focus())
		},
		memo: {
			previous: 'quantity',
			reset,
			next: transact,
			success: 'complete',
			error: 'error',
			_enter: () => tick().then(() => memoRef?.focus())
		},
		complete: {
			reset
		},
		error: {
			previous: 'to',
			reset
		}
	});

	let assetValid = $state(false);
	let assetValidPrecision = $state(false);
	let assetValidMinimum = $state(false);
	let assetValidMaximum = $state(false);
	let memoValid = $state(true); // TODO: Implement validation
	let toValid = $state(false);

	const nextValid = $derived.by(() => {
		switch (f.current) {
			case 'to':
				return toValid;
			case 'quantity':
				return assetValid;
			case 'memo':
				return memoValid;
		}
	});

	const allValid = $derived(toValid && assetValid && memoValid);
	const ready = $derived(allValid && !context.wharf.transacting);

	const progress = $derived.by(() => {
		switch (f.current) {
			case 'to':
				return 1;
			case 'quantity':
				return 2;
			default:
			case 'memo':
				return 3;
		}
	});

	const next = () => f.send('next');
	const previous = () => f.send('previous');

	function resetBalance() {
		if (context.account) {
			const balance = context.account.balances.find((b) => tokenEquals(b.token.id, data.token.id));
			if (balance) {
				tokenSelect?.set(balance);
				sendState.setBalance(balance);
				quantityInput?.set(sendState.quantity);
			}
		}
	}

	async function resetState() {
		// Reset the inputs
		toInput?.set('');
		resetBalance();
		tokenSelect?.set(sendState.balance);
		sendState.memo = '';

		// Reset associated transaction ID
		id = undefined;

		// Focus the "to" input field
		await tick();
		toRef?.focus();
	}

	async function resetURL() {
		page.url.searchParams.delete('to');
		page.url.searchParams.delete('quantity');
		await goto(`?${page.url.searchParams.toString()}`);
		f.send('reset');
	}

	function reset(): FormStates {
		// Call reset
		resetState();

		// Return the state it should reset to
		return 'to';
	}

	const subtitle = {
		to: 'Recipient',
		quantity: 'Asset',
		memo: 'Confirm',
		complete: 'Complete',
		error: 'Error'
	};

	const tokenOptions: TokenBalance[] = $derived.by(() => {
		if (context.account && context.account.balances) {
			return context.account.balances.filter((b) => !b.locked);
		}
		return [];
	});

	function onkeydown(event: Event) {
		const { key } = event as KeyboardEvent;
		if (key === 'Enter') {
			if (f.current === 'memo') {
				transact();
			} else {
				next();
			}
		}
		if (key === 'Escape') {
			if (f.current === 'to') {
				resetURL();
			} else {
				previous();
			}
		}
	}
</script>

{#snippet Recipient()}
	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'to'}>
		<Label for="to-input">Recipient</Label>
		<NameInput
			bind:this={toInput}
			bind:ref={toRef}
			bind:value={sendState.to}
			bind:valid={toValid}
			id="to-input"
			name="recipient"
			{onkeydown}
			placeholder="Who are you sending to?"
		/>
	</fieldset>
{/snippet}

{#snippet Quantity()}
	<section class="grid gap-6" class:hidden={!showAll && f.current !== 'quantity'}>
		<fieldset class="grid gap-2">
			<Label for="token-select">Token to send</Label>
			{#if tokenOptions.length}
				<TokenSelect
					id="token-select"
					bind:this={tokenSelect}
					options={tokenOptions}
					onSelectedChange={({ curr, next }) => {
						if (next) {
							const balance = tokenOptions[next.value];
							sendState.setBalance(balance);
							quantityInput?.set(sendState.quantity);
							return next;
						}
						return curr;
					}}
				/>
			{:else}
				<p>No balances found.</p>
			{/if}
		</fieldset>

		<fieldset class="grid gap-2">
			<Label for="quantity-input">Amount to send</Label>
			<AssetInput
				id="quantity-input"
				bind:this={quantityInput}
				bind:ref={quantityRef}
				bind:value={sendState.quantity}
				bind:valid={assetValid}
				bind:validPrecision={assetValidPrecision}
				bind:validMinimum={assetValidMinimum}
				bind:validMaximum={assetValidMaximum}
				min={sendState.min || 0}
				max={sendState.max || 0}
				{onkeydown}
				placeholder="Enter the amount of {sendState.quantity.symbol.code} to send"
			/>

			{#if context.account}
				<Button variant="text" disabled={!context.account} onclick={max}>Fill Max</Button>
			{/if}

			{#if assetValid && sendState.value}
				<Label for="quantity-input">Value: {formatCurrency(sendState.value)}</Label>
			{/if}

			{#if !assetValidPrecision}
				<p class="text-error">Invalid number, too many decimal places.</p>
			{/if}

			{#if !assetValidMaximum}
				<p class="text-error">Amount exceeds available balance.</p>
			{/if}
		</fieldset>
	</section>
{/snippet}

{#snippet Memo()}
	<div class:hidden={!showAll && f.current !== 'memo'} class="space-y-4">
		<ActionSummaryContainer>
			<SummarySend data={sendState.toJSON()} />
		</ActionSummaryContainer>

		<fieldset class="grid gap-2">
			<Label for="memo-input">Memo (Optional)</Label>
			<TextInput
				id="memo-input"
				bind:ref={memoRef}
				bind:value={sendState.memo}
				{onkeydown}
				placeholder="Specify a public memo for this transfer (optional)"
			/>
		</fieldset>
	</div>
{/snippet}

{#snippet Complete()}
	<TransactSummary hidden={f.current !== 'complete'} transactionId={id} />
{/snippet}

{#snippet Error()}
	<TransactError hidden={f.current !== 'error'} {error} />
{/snippet}

{#snippet ButtonGroup()}
	<fieldset class="grid grid-cols-1 gap-2 @sm:grid-cols-2">
		{#if f.current === 'to'}
			<Button variant="secondary" onclick={() => resetURL()}>Restart</Button>
		{:else if f.current === 'complete'}
			<Button variant="secondary" onclick={() => resetURL()}>Start new send</Button>
			<Button href={context.urlPath(`/account/${context.account?.name}`)}>View my account</Button>
		{:else}
			<Button variant="secondary" onclick={previous}>Back</Button>
		{/if}

		{#if f.current === 'memo'}
			<Button class="" onclick={transact} disabled={!ready}>Submit</Button>
		{:else if f.current !== 'complete'}
			<Button class="" type="submit" onclick={preventDefault(next)} disabled={!nextValid}>
				Next
			</Button>
		{/if}
	</fieldset>
{/snippet}

<SingleCard>
	<Stack>
		<div class="hidden">
			<h3>{subtitle[f.current]}</h3>
			<Progress currentStep={progress} maxStep={3} />
		</div>

		{@render Complete()}

		{@render Error()}

		{@render Recipient()}

		{@render Quantity()}

		{@render Memo()}

		{@render ButtonGroup()}
	</Stack>
</SingleCard>

{#if context.settings.data.debugMode}
	<h3 class="text-title">Debugging</h3>
	<Code
		>{JSON.stringify(
			{
				state: sendState.toJSON(),
				// price: sendState.price,
				// value: sendState.value,
				current: f.current,
				balance: sendState.balance,
				max: sendState.max,
				valid: {
					toValid,
					assetValid,
					memoValid,
					assetValidPrecision,
					assetValidMinimum,
					assetValidMaximum
				},
				balances: context.account?.balances
			},
			undefined,
			2
		)}</Code
	>
{/if}
