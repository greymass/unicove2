<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import {
		Checksum256,
		PlaceholderAuth,
		PublicKey,
		ResolvedSigningRequest,
		Serializer,
		SigningRequest,
		type NameType
	} from '@wharfkit/session';
	import { Button, Label, TextInput, CopyButton, Code } from '@wharfkit/svelte-components';
	import * as zlib from 'pako';

	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import { requestPublicKeys, requestSnap } from '$lib/metamask-snap.js';
	import * as SystemContract from '$lib/wharf/contracts/system';
	import AccountElement from '$lib/components/elements/account.svelte';
	import ActionElement from '$lib/components/elements/action.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { goto } from '$app/navigation';

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;
	const { data } = $props();

	const request = SigningRequest.from(`esr:` + data.payload, { zlib });
	let resolved: ResolvedSigningRequest | undefined = $state();
	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
	let actions: Record<string, unknown>[] = $state([]);

	const disabled = $derived(!context.wharf.session || !resolved);

	async function resolve() {
		let permissionLevel = PlaceholderAuth;
		if (context.wharf.session) {
			permissionLevel = context.wharf.session.permissionLevel;
		}
		const abis = await request.fetchAbis(context.network.abis);
		const info = await context.network.client.v1.chain.get_info();
		resolved = request.resolve(abis, permissionLevel, info.getTransactionHeader(3600));
		actions = resolved.transaction.actions.map((action) => {
			const abi = abis.get(String(action.account));
			if (abi) {
				return Serializer.objectify(action.decodeData(abi));
			}
		});
	}

	// State for account creation requests
	let isAccountCreated = $state(false);
	let newAccountPermissions: SystemContract.Types.authority[] = $state([]);
	const newAccountAction = $derived.by(() => {
		const action = resolved?.transaction.actions.find(
			(action) =>
				action.account.equals(context.network.config.systemcontract) &&
				action.name.equals('newaccount')
		);
		if (action) {
			return Serializer.decode({
				data: action.data,
				type: SystemContract.Types.newaccount
			});
		}
	});

	function matchesExpectedAuthority(
		authority: SystemContract.Types.authority,
		publicKey: PublicKey
	) {
		const matchesExpectedThreshold = authority.threshold.equals(1);
		const matchesExpectedKey =
			authority.keys.length === 1 && authority.keys[0].key.equals(publicKey);
		const matchesExpectedWeight = authority.keys[0].weight.equals(1);
		const matchesExpectedAccounts = authority.accounts.length === 0;
		const matchesExpectedWaits = authority.waits.length === 0;
		return (
			matchesExpectedThreshold &&
			matchesExpectedKey &&
			matchesExpectedWeight &&
			matchesExpectedAccounts &&
			matchesExpectedWaits
		);
	}

	const newAccountActionMatchesMetaMask = $derived.by(() => {
		if (
			newAccountAction &&
			newAccountPermissions &&
			context.metamask.publicKey &&
			context.metamask.ownerKey
		) {
			return (
				newAccountPermissions.length === 2 &&
				matchesExpectedAuthority(newAccountAction.active, context.metamask.publicKey) &&
				matchesExpectedAuthority(newAccountAction.owner, context.metamask.ownerKey)
			);
		}
		return false;
	});

	const newAccountMatchesMetaMask = $derived.by(() => {
		if (
			newAccountAction &&
			newAccountPermissions &&
			context.metamask.publicKey &&
			context.metamask.ownerKey
		) {
			return (
				newAccountPermissions.length === 2 &&
				matchesExpectedAuthority(newAccountPermissions[0], context.metamask.publicKey) &&
				matchesExpectedAuthority(newAccountPermissions[1], context.metamask.ownerKey)
			);
		}
		return false;
	});

	function doesAccountExist(name: NameType) {
		return context.network
			.doesAccountExist(name)
			.then((exists) => (isAccountCreated = exists))
			.catch(() => (isAccountCreated = false));
	}

	let accountExistsCheckInterval: ReturnType<typeof setInterval>;
	$effect(() => {
		// If this is an account creation request, check if the account already exists
		if (newAccountAction) {
			doesAccountExist(newAccountAction.name);
			accountExistsCheckInterval = setInterval(() => doesAccountExist(newAccountAction.name), 5000);
		}
	});

	$effect(() => {
		// If the account exists, load its permissions to check if it matches
		if (isAccountCreated && newAccountAction) {
			context.network.client.v1.chain
				.get_account(newAccountAction.name)
				.then((account) => {
					newAccountPermissions = account.permissions.map((perm) => {
						return SystemContract.Types.authority.from(perm.required_auth);
					});
				})
				.catch((error) => {
					console.error('Error fetching account:', error);
				});
		}
	});

	$effect(() => {
		// Call resolve on session change
		if (context.wharf.session) {
			resolve();
		}
	});

	$effect(() => {
		// If MetaMask is ready and the snap is detected, request the snap and public keys
		if (
			context.metamask.isMetaMaskReady &&
			context.metamask.snapOrigin &&
			!context.metamask.publicKey
		) {
			requestSnap(context.metamask);
			requestPublicKeys(context.metamask, context.wharf);
		}
	});

	onMount(resolve);

	onDestroy(() => {
		clearInterval(accountExistsCheckInterval);
	});

	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	function transact() {
		context.wharf
			.transact({ request })
			.then((result) => {
				id = result?.resolved?.transaction.id;
			})
			.catch((e) => {
				console.error('Transaction error', e);
				error = e;
			});
	}

	function login() {
		if (newAccountAction) {
			context.wharf
				.login({
					chain: context.network.chain.id,
					permissionLevel: `${newAccountAction.name}@active`,
					walletPlugin: 'wallet-plugin-metamask'
				})
				.then(() => {
					goto(`/${context.network}/account/${newAccountAction.name}`);
				});
		}
	}
</script>

{#snippet Success()}
	<div class="flex gap-4">
		<Button variant="secondary" onclick={() => (id = undefined)}>Back</Button>
		<Button href={urlPath(`/account/${newAccountAction?.name}`)}>Visit Account</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex gap-4">
		<Button onclick={() => (error = undefined)}>Back</Button>
	</div>
{/snippet}

<TransactForm {id} {error} onsuccess={Success} onfailure={Failure}>
	{#if newAccountAction}
		<section class="@container">
			<div class="bg-surface-container space-y-4 rounded-2xl p-8">
				{#if isAccountCreated}
					{#if newAccountMatchesMetaMask}
						<h2 class="h2">Account Ready!</h2>
						<p>
							Your account creation request for
							<AccountElement name={newAccountAction.name} />
							has been completed.
						</p>
						<Button onclick={login}>Login</Button>
					{:else if newAccountActionMatchesMetaMask && !newAccountMatchesMetaMask}
						<h2 class="h2">Malicious Activity Detected</h2>
						<p>
							Unicove cannot verify that this account was created safely and recommends against
							using it. Whoever signed the request has modified the keys of this account, which
							means this account may be at risk. Do not use this account.
						</p>
						<p>
							Try creating a new request with a new account name, and find a different person to
							create your account.
						</p>
					{:else}
						<h2 class="h2">Request complete, this account has been created.</h2>
						<Button href={`${urlPath(`/account/${newAccountAction.name}`)}`}>View Account</Button>
					{/if}
				{:else if newAccountMatchesMetaMask}
					<h2 class="h2">Account Creation Request</h2>
					<p>
						Your account creation request is ready. Share the URL of this page with an existing
						account holder so they can create your account.
					</p>
					<fieldset class="grid gap-2">
						<Label for="memo-input">Share Link</Label>

						<TextInput value={window.location.href} disabled>
							<CopyButton data={window.location.href} />
						</TextInput>
					</fieldset>
					<p>
						Once the account has been created, return to this page to ensure it was created
						successfully and to login!
					</p>
				{:else}
					<h2 class="h2">Account Creation Request</h2>
					<p>Someone has requested an account named {newAccountAction.name} be created.</p>
					<p>
						If you are willing to create this account, review the details below and perform the
						transaction.
					</p>
					<p>If you created this request, connect your MetaMask wallet.</p>
				{/if}
			</div>
		</section>
	{/if}
	{#if resolved && resolved.resolvedTransaction.actions.length > 0}
		{#if !isAccountCreated}
			<h2 class="h2">Transaction Details</h2>
			<SelectActionVariant />
			<ol class="grid gap-12">
				{#each resolved.transaction.actions as proposedAction, i}
					{@const contract = String(proposedAction.account)}
					{@const action = String(proposedAction.name)}
					{@const summary = getActionSummaryComponent(contract, action, proposedAction.data)}
					<li class="">
						<ActionElement action={proposedAction} objectified={actions[i]} {summary} {variant} />
					</li>
				{/each}
				{#if context.wharf.session}
					<Button onclick={transact}>Perform transaction</Button>
				{:else}
					<Button {disabled} onclick={transact}
						>Sign-in with your wallet to perform this transaction</Button
					>
				{/if}
			</ol>
		{/if}
	{/if}
</TransactForm>

{#if context.settings.data.debugMode}
	<h3 class="h3">Debugging</h3>
	<Code
		json={{
			disabled,
			isAccountCreated,
			newAccountAction,
			newAccountPermissions,
			newAccountMatchesMetaMask,
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
