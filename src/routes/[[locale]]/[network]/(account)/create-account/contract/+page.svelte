<script lang="ts">
	import { Asset, Name, PublicKey } from '@wharfkit/antelope';
	import { getContext, onDestroy, onMount, tick } from 'svelte';
	import { Debounced, FiniteStateMachine } from 'runed';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';

	import { preventDefault } from '$lib/utils';
	import { Label } from '@wharfkit/svelte-components';
	import { NameInput } from '@wharfkit/svelte-components';
	import { PublicKeyInput } from '@wharfkit/svelte-components';
	import { SingleCard } from '$lib/components/layout';
	import { Stack } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import { CopyButton } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Code } from '@wharfkit/svelte-components';
	import AccountText from '$lib/components/elements/account.svelte';
	import { buildCreationMemo, isValidCreationName } from '$lib/utils/create/memo';
	import { CreationWatcher } from './watcher.svelte';

	const context = getContext<UnicoveContext>('state');

	let accountInput: NameInput | undefined = $state();
	let accountRef: HTMLInputElement | undefined = $state();
	let accountValid = $state(false);
	let accountName: Name = $state(Name.from(''));

	const debouncedAccount = new Debounced(() => accountName, 500);
	let accountExists = $state(false);
	let checkingAccount = $state(false);
	let accountLengthValid = $derived(isValidCreationName(accountName));
	let accountCheckPending = $derived(String(debouncedAccount.current) !== String(accountName));
	let accountCheckId = 0;

	$effect(() => {
		const name = String(debouncedAccount.current);
		if (!name || !accountValid || !accountLengthValid) {
			checkingAccount = false;
			accountExists = false;
			return;
		}
		const id = ++accountCheckId;
		checkingAccount = true;
		context.network
			.doesAccountExist(debouncedAccount.current)
			.then((exists) => {
				if (id === accountCheckId) accountExists = exists;
			})
			.catch(() => {
				if (id === accountCheckId) accountExists = false;
			})
			.finally(() => {
				if (id === accountCheckId) checkingAccount = false;
			});
	});

	let publicKeyInput: PublicKeyInput | undefined = $state();
	let publicKeyRef: HTMLInputElement | undefined = $state();
	let publicKeyValid = $state(false);
	let publicKey: PublicKey | undefined = $state();

	let cost: Asset | undefined = $state();
	let costAmount: string | undefined = $derived(cost?.quantity);
	let memo: string = $derived(publicKey ? buildCreationMemo(accountName, publicKey) : '');

	let sendAccount = $derived(String(context.network.contracts.create.account));

	const watcher = new CreationWatcher(
		context.network,
		() => accountName,
		() => publicKey
	);

	onDestroy(() => watcher.stop());

	// The state which the submit form can exist in
	type FormStates = 'account' | 'publickey' | 'create' | 'complete' | 'taken';

	// The events which can modify state
	type FormEvents = 'next' | 'previous' | 'reset' | 'created' | 'taken';

	// For debugging, show all fields
	const showAll = false;

	const f = new FiniteStateMachine<FormStates, FormEvents>('account', {
		account: {
			next: () => (accountValid ? 'publickey' : 'account'),
			reset,
			_enter: () => tick().then(() => accountRef?.focus())
		},
		publickey: {
			previous: 'account',
			next: () => (publicKeyValid ? 'create' : 'publickey'),
			reset,
			_enter: () => tick().then(() => publicKeyRef?.focus())
		},
		create: {
			previous: 'publickey',
			created: 'complete',
			taken: 'taken',
			_enter: () => {
				persistProgress();
				watcher.start();
			},
			_exit: () => watcher.stop()
		},
		complete: {},
		taken: {
			reset
		}
	});

	const next = () => f.send('next');
	const previous = () => f.send('previous');

	$effect(() => {
		if (watcher.found) {
			f.send('created');
		} else if (watcher.taken) {
			f.send('taken');
		}
	});

	function persistProgress() {
		if (!publicKey) {
			return;
		}
		const params = new URLSearchParams(page.url.searchParams);
		params.set('account', String(accountName));
		params.set('active', String(publicKey));
		try {
			replaceState(`?${params.toString()}`, {});
		} catch (e) {
			console.warn('Unable to persist progress to the URL', e);
		}
	}

	onMount(async () => {
		accountRef?.focus();

		const params = page.url.searchParams;
		try {
			if (params.has('account') && params.has('active')) {
				accountName = Name.from(params.get('account') as string);
				accountInput?.set(String(accountName));
				publicKey = PublicKey.from(params.get('active') as string);
				publicKeyInput?.set(String(publicKey));
				await tick();
				f.send('next');
				f.send('next');
			}
		} catch (e) {
			console.warn('Unable to process URL parameters', params, e);
		}

		const result = await context.network.contracts.create.readonly('estimatecost', {});
		const modified = Asset.from(result);
		modified.units.add(2000);
		cost = modified;
	});

	function onkeydown(event: Event) {
		const { key } = event as KeyboardEvent;
		if (key === 'Enter') {
			next();
		}
		if (key === 'Escape') {
			if (f.current === 'account') {
				resetURL();
			} else {
				previous();
			}
		}
	}

	const nextValid = $derived.by(() => {
		switch (f.current) {
			case 'account':
				return (
					accountValid &&
					accountLengthValid &&
					!accountExists &&
					!checkingAccount &&
					!accountCheckPending
				);
			case 'publickey':
				return publicKeyValid;
		}
	});

	async function resetState() {
		// Reset the inputs
		if (accountInput) {
			accountInput.set('');
		}
		if (publicKeyInput) {
			publicKeyInput.set('');
		}

		accountName = Name.from('');
		publicKey = undefined;

		// Focus the "to" input field
		await tick();
		accountRef?.focus();
	}

	function reset(): FormStates {
		// Call reset
		resetState();

		// Return the state it should reset to
		return 'account';
	}

	async function resetURL() {
		const params = new URLSearchParams(page.url.searchParams);
		params.delete('account');
		params.delete('active');
		await goto(`?${params.toString()}`);
		f.send('reset');
	}
</script>

{#snippet AccountName()}
	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'account'}>
		<Label for="account-input">Account Name</Label>
		<NameInput
			bind:this={accountInput}
			bind:ref={accountRef}
			bind:value={accountName}
			bind:valid={accountValid}
			{onkeydown}
			id="account-input"
			placeholder="Account Name"
		/>
		{#if String(accountName).length > 0 && !accountLengthValid}
			<p class="text-error text-sm">Account names must be exactly 12 characters.</p>
		{:else if checkingAccount || accountCheckPending}
			<p class="text-on-surface-variant text-sm">Checking availability&hellip;</p>
		{:else if accountExists}
			<p class="text-error text-sm">That name is already taken. Try another.</p>
		{:else if accountLengthValid && accountValid}
			<p class="text-sm">That name is available.</p>
		{/if}
	</fieldset>
{/snippet}

{#snippet PublicKeyStep()}
	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'publickey'}>
		<Label for="public-key-input">Public Key</Label>
		<PublicKeyInput
			bind:this={publicKeyInput}
			bind:ref={publicKeyRef}
			bind:value={publicKey}
			bind:valid={publicKeyValid}
			{onkeydown}
			id="public-key-input"
			placeholder="Public Key"
		/>
		<p class="text-on-surface-variant text-sm">
			This key will have full control of your new account. It becomes both the owner and active key.
		</p>
		{#if context.wharf.session}
			<p class="text-on-surface-variant text-sm">
				You're signed in already, so
				<a class="text-primary" href={context.urlPath('/create-account/direct')}>
					creating from your existing account
				</a>
				is faster.
			</p>
		{/if}
	</fieldset>
{/snippet}

{#snippet Create()}
	<div class="grid gap-4" class:hidden={!showAll && f.current !== 'create'}>
		<div class="grid gap-1">
			<h2 class="text-headline">Send tokens to create your account</h2>
			<p class="text-on-surface-variant text-sm">
				Withdraw from an exchange, or send from any existing account. All three values must match
				exactly.
			</p>
		</div>

		<dl class="grid gap-3">
			<div class="grid gap-1">
				<dt class="text-on-surface-variant text-xs tracking-wide uppercase">Send at least</dt>
				<dd class="flex items-center justify-between gap-2 font-mono">
					<span>{cost ? String(cost) : '—'}</span>
					<CopyButton data={costAmount ?? ''} />
				</dd>
			</div>

			<div class="grid gap-1">
				<dt class="text-on-surface-variant text-xs tracking-wide uppercase">To account</dt>
				<dd class="flex items-center justify-between gap-2 font-mono">
					<span>{sendAccount}</span>
					<CopyButton data={sendAccount} />
				</dd>
			</div>

			<div class="border-primary grid gap-1 border-l-2 pl-3">
				<dt class="text-on-surface-variant text-xs tracking-wide uppercase">With this memo</dt>
				<dd class="flex items-center justify-between gap-2 font-mono break-all">
					<span>{memo}</span>
					<CopyButton data={memo} />
				</dd>
				<p class="text-sm">The transfer will not create your account without this exact memo.</p>
			</div>
		</dl>

		<p class="text-on-surface-variant text-sm">
			Anything you send above the minimum becomes your new account's opening balance.
		</p>

		<div class="bg-surface-container grid gap-2 rounded-xl p-4">
			{#if watcher.polling}
				<p class="text-center font-bold">Waiting for transfer&hellip;</p>
			{/if}
			<p class="text-on-surface-variant text-center text-sm">
				Keep this page open until the transfer arrives.
			</p>
		</div>
	</div>
{/snippet}

{#snippet Complete()}
	<div class="grid gap-4" class:hidden={f.current !== 'complete'}>
		<h3 class="text-title">Account created</h3>
		<p>
			<AccountText name={accountName} /> is ready to use.
		</p>
		<Button
			onclick={() =>
				context.wharf.login({
					chain: context.network.chain.id,
					permissionLevel: `${accountName}@active`
				})}
		>
			Sign in with this account
		</Button>
		<Button variant="secondary" href={context.urlPath(`/account/${accountName}`)}>
			View account
		</Button>
	</div>
{/snippet}

{#snippet Taken()}
	<div class="grid gap-4" class:hidden={f.current !== 'taken'}>
		<h3 class="text-title">Name already taken</h3>
		<p>
			Someone else registered <strong>{accountName}</strong> before your transfer arrived. A transfer
			for a name that already exists will not go through, so your tokens stay where they are. Choose
			another name and start again.
		</p>
		<Button variant="secondary" onclick={() => resetURL()}>Start over</Button>
	</div>
{/snippet}

{#snippet ButtonGroup()}
	<fieldset
		class="flex gap-2 *:flex-1"
		class:hidden={f.current === 'create' || f.current === 'complete' || f.current === 'taken'}
	>
		{#if f.current === 'account'}
			<Button variant="secondary" onclick={() => resetURL()}>Restart</Button>
		{:else}
			<Button variant="secondary" onclick={previous}>Back</Button>
		{/if}

		<Button class="col-end-3" type="submit" onclick={preventDefault(next)} disabled={!nextValid}>
			Next
		</Button>
	</fieldset>
{/snippet}

<SingleCard>
	<Stack>
		{@render AccountName()}

		{@render PublicKeyStep()}

		{@render Create()}

		{@render Complete()}

		{@render Taken()}

		{@render ButtonGroup()}
	</Stack>
</SingleCard>

{#if context.settings.data.debugMode}
	<h3 class="text-title">Debugging</h3>
	<Code
		>{JSON.stringify(
			{
				cost,
				values: {
					accountName,
					publicKey
				},
				valid: {
					accountValid,
					publicKeyValid
				}
			},
			undefined,
			2
		)}</Code
	>
{/if}
