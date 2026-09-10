<script lang="ts">
	import { Action, Name, PublicKey } from '@wharfkit/antelope';
	import { PlaceholderAuth, PlaceholderName, SigningRequest } from '@wharfkit/session';
	import { getContext } from 'svelte';
	import { Debounced, FiniteStateMachine } from 'runed';
	import * as zlib from 'pako';

	import { preventDefault } from '$lib/utils';
	import MetaMaskRequired from '$lib/components/wallets/metamask/required.svelte';
	import { SingleCard } from '$lib/components/layout';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { requestPublicKeys, requestSnap } from '$lib/metamask-snap';
	import { goto } from '$app/navigation';
	import { Types as VaultaTypes } from '$lib/wharf/contracts/core.vaulta';
	import { Label, NameInput, Button, Code, Stack } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');

	// For debugging, show all fields
	const showAll = false;

	let accountInput: NameInput | undefined = $state();
	let accountRef: HTMLInputElement | undefined = $state();
	let accountName: Name = $state(Name.from(''));
	let accountValid = $state(false);
	let accountValidByLength = $derived.by(() => String(accountName).length === 12);
	const ramBytes = 2000; // Default RAM bytes for account creation
	const debouncedAccount = new Debounced(() => accountName, 500);
	let accountExists = $state(true);
	let requestValid = $derived.by(() => {
		return accountValid && !accountExists && accountValidByLength;
	});

	$effect(() => {
		const name = String(debouncedAccount.current);
		if (name && accountValid && accountValidByLength) {
			context.network
				.doesAccountExist(debouncedAccount.current)
				.then((exists) => (accountExists = exists))
				.catch(() => (accountExists = false));
		}
	});

	$effect(() => {
		if (
			context.metamask.isMetaMaskReady &&
			context.metamask.snapOrigin &&
			!context.metamask.publicKey
		) {
			requestSnap(context.metamask);
		}
	});

	let publicKey: PublicKey | null = $derived(context.metamask.publicKey);
	let ownerKey: PublicKey | null = $derived(context.metamask.ownerKey);

	// The state which the submit form can exist in
	type FormStates = 'welcome' | 'setup' | 'request' | 'wait' | 'error';

	// The events which can modify state
	type FormEvents = 'next' | 'previous' | 'error';

	const f = new FiniteStateMachine<FormStates, FormEvents>('welcome', {
		welcome: {
			next: 'setup'
		},
		setup: {
			next: () => {
				requestSnap(context.metamask);
				requestPublicKeys(context.metamask, context.wharf);
				return 'request';
			}
		},
		request: {
			next: 'wait'
		},
		wait: {},
		error: {}
	});

	const next = () => f.send('next');

	const actions = $derived.by(() => {
		if (!accountName || !publicKey || !ownerKey) {
			return;
		}

		const contract = context.network.contracts.system;

		let ramaction = contract.action('buyrambytes', {
			payer: PlaceholderName,
			receiver: accountName,
			bytes: ramBytes
		});

		if (context.network.supports('giftedram')) {
			ramaction = Action.from({
				account: contract.account,
				name: 'giftram',
				authorization: [PlaceholderAuth],
				data: VaultaTypes.giftram.from({
					from: PlaceholderName,
					receiver: accountName,
					ram_bytes: ramBytes,
					memo: 'Account Creation'
				})
			});
		}

		return [
			contract.action('newaccount', {
				creator: PlaceholderName,
				name: accountName,
				owner: {
					accounts: [],
					keys: [{ key: ownerKey, weight: 1 }],
					threshold: 1,
					waits: []
				},
				active: {
					accounts: [],
					keys: [{ key: publicKey, weight: 1 }],
					threshold: 1,
					waits: []
				}
			}),
			ramaction
		];
	});

	let redirectLink: string | undefined = $state();
	let redirecting = $state(false);
	async function redirectRequest() {
		if (actions && actions.length) {
			const opts = {
				zlib
			};
			const request = await SigningRequest.create({ actions }, opts);
			redirectLink = context.urlPath(`/prompt/${request.encode(true, false, '')}`);
			redirecting = true;
			goto(redirectLink);
		}
	}
</script>

{#snippet AccountName()}
	<div class="space-y-2" class:hidden={!showAll && f.current !== 'request'}>
		<fieldset class="grid gap-2">
			<Label for="account-input">Account Name</Label>
			<NameInput
				bind:this={accountInput}
				bind:ref={accountRef}
				bind:value={accountName}
				bind:valid={accountValid}
				id="account-input"
				placeholder="Account Name"
			/>
			<p>
				Select the 12-character long account name you'd like to register. Use only lowercase A-Z and
				1-5.
			</p>
		</fieldset>
		<Button
			class="col-end-3"
			type="submit"
			disabled={!requestValid || redirecting}
			onclick={preventDefault(redirectRequest)}
		>
			Create Request
		</Button>
		{#if redirectLink}
			<p>If you are not automatically redirected, click the button below:</p>
			<Button href={redirectLink}>View Account Creation Request</Button>
		{/if}
	</div>
{/snippet}

{#snippet Welcome()}
	<div class="space-y-2" class:hidden={!showAll && f.current !== 'welcome'}>
		<p>Don't have an account, but know someone willing to create an account for you?</p>
		<p>
			This page will help walk you through setting up your first wallet and then create a link you
			can securely share with them, allowing them to easily create an account for you.
		</p>
		<h1>Click the Get Started button below and you'll be walked through:</h1>
		<ol class="ml-8 list-decimal">
			<li>Installing MetaMask + EOS Wallet.</li>
			<li>Selecting an available account name.</li>
			<li>Create a sharable link to share with an existing user.</li>
		</ol>
		<p>
			Once the existing user creates the account, you'll be able to login and verify it was
			successfully created and linked to your MetaMask wallet!
		</p>
		<Button onclick={preventDefault(next)}>Get Started</Button>
	</div>
{/snippet}

{#snippet Setup()}
	<div class="grid gap-2" class:hidden={!showAll && f.current !== 'setup'}>
		<MetaMaskRequired callback={() => f.send('next')}>
			<p>MetaMask + EOS Wallet is installed and connected!</p>
			<p>Version: {context.metamask.installedSnap?.version}</p>
		</MetaMaskRequired>
	</div>
{/snippet}

<SingleCard>
	<Stack>
		{@render Welcome()}
		{@render Setup()}
		{@render AccountName()}
	</Stack>
</SingleCard>

{#if context.settings.data.debugMode}
	<h3 class="h3">Debugging</h3>
	<Code
		json={{
			state: f.current,
			accountExists,
			snapOrigin: context.metamask.snapOrigin,
			isFlask: context.metamask.isFlask,
			isInstalled: context.metamask.isInstalled,
			error: context.metamask.error,
			installedSnap: context.metamask.installedSnap,
			publicKey: context.metamask.publicKey,
			ownerKey: context.metamask.ownerKey
		}}
	/>
{/if}
