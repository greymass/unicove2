<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { page } from '$app/state';

	import { Stack, Button, Label, PublicKeyInput, NumberInput } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import AccountText from '$lib/components/elements/account.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { ClaimManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: ClaimManager = $state(new ClaimManager(data.network));

	let useCurrentKeys: boolean = $state(true);
	let ownerKeyValid = $state(false);
	let activeKeyValid = $state(false);
	let ownerKeyInput: PublicKeyInput | undefined = $state();
	let activeKeyInput: PublicKeyInput | undefined = $state();
	let ramBytesValid = $state(true);
	let customRam = $state(false);

	$effect(() => {
		if (useCurrentKeys) {
			manager.ownerKey = manager.accountOwnerKey;
			manager.activeKey = manager.accountActiveKey;
			if (manager.accountOwnerKey) {
				ownerKeyInput?.set(String(manager.accountOwnerKey));
			}
			if (manager.accountActiveKey) {
				activeKeyInput?.set(String(manager.accountActiveKey));
			}
		}
	});

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	onMount(() => {
		const name = page.url.searchParams.get('name');
		if (name) {
			manager.bidName = name;
			manager.loadBid();
		}
	});

	$effect(() => {
		if (manager.bidName) {
			manager.loadBid();
		}
	});

	function resetState() {
		manager.error = '';
		manager.txid = '';
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={context.urlPath(`/bidname`)} variant="secondary">Back to Premium Names</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Try Again</Button>
	{:else if !context.account}
		<p class="text-muted">Please log in to claim a name.</p>
	{:else if manager.loading}
		<p class="text-muted">Loading bid information...</p>
	{:else if manager.isClaimed}
		<Stack class="gap-2">
			<h3 class="text-on-surface text-xl font-semibold">{manager.bidName}</h3>
			<p class="text-muted">
				This name has already been claimed. The account exists on the network.
			</p>
			<Button href={context.urlPath(`/account/${manager.bidName}`)} variant="secondary"
				>View Account</Button
			>
		</Stack>
	{:else if !manager.currentBid}
		<p class="text-muted">No bid found for "{manager.bidName}".</p>
	{:else if !manager.isWon}
		<Stack class="gap-2">
			<h3 class="text-on-surface text-xl font-semibold">{manager.bidName}</h3>
			<p class="text-muted">This auction has not been won yet. The auction is still active.</p>
		</Stack>
	{:else if !manager.isHighBidder}
		<Stack class="gap-2">
			<h3 class="text-on-surface text-xl font-semibold">{manager.bidName}</h3>
			<p class="text-muted">
				This name was won by <AccountText name={manager.currentBid.high_bidder} />. Only the winning
				bidder can claim this name.
			</p>
		</Stack>
	{:else}
		<Stack class="gap-4">
			<Stack class="gap-1">
				<p class="text-on-surface text-2xl font-bold">{manager.bidName}</p>
				<p class="text-muted text-sm">
					You won this name. Claiming it will create a new account on the network.
				</p>
			</Stack>

			<div class="bg-surface-container-high space-y-4 rounded-xl p-4">
				<p class="text-muted text-sm">
					{#if useCurrentKeys}
						The new account will use the same keys as your current account
						<strong class="text-on-surface"><AccountText name={context.account.name} /></strong>, so
						your existing wallet will control it.
					{:else}
						Enter the public keys that will control the new account.
					{/if}
				</p>

				<fieldset class="grid gap-2">
					<Label for="owner-key-input">Owner Public Key</Label>
					<PublicKeyInput
						bind:this={ownerKeyInput}
						bind:value={manager.ownerKey}
						bind:valid={ownerKeyValid}
						id="owner-key-input"
						placeholder="Owner Public Key"
						disabled={useCurrentKeys}
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="active-key-input">Active Public Key</Label>
					<PublicKeyInput
						bind:this={activeKeyInput}
						bind:value={manager.activeKey}
						bind:valid={activeKeyValid}
						id="active-key-input"
						placeholder="Active Public Key"
						disabled={useCurrentKeys}
					/>
				</fieldset>

				<div class="text-center">
					<Button
						variant="text"
						onclick={() => {
							useCurrentKeys = !useCurrentKeys;
							if (!useCurrentKeys) {
								manager.ownerKey = undefined;
								manager.activeKey = undefined;
								ownerKeyInput?.set('');
								activeKeyInput?.set('');
							}
						}}
					>
						{#if useCurrentKeys}
							Use custom public keys instead
						{:else}
							Use keys from my current account
						{/if}
					</Button>
				</div>
			</div>

			<div class="text-muted flex items-baseline justify-between text-sm">
				<span>
					Account creation cost:
					{#if manager.ramCost}
						<strong class="text-on-surface">{String(manager.ramCost)}</strong>
					{/if}
					<span class="text-xs">({manager.ramBytes} bytes RAM)</span>
				</span>
				<Button
					variant="text"
					class="text-xs"
					onclick={() => {
						if (customRam) {
							manager.ramBytes = 2000;
						}
						customRam = !customRam;
					}}
				>
					{customRam ? 'Reset' : 'Change'}
				</Button>
			</div>

			{#if customRam}
				<fieldset class="grid gap-2">
					<Label for="ram-bytes-input">RAM bytes (min: {manager.ramBytesMin})</Label>
					<NumberInput
						bind:value={manager.ramBytes}
						bind:valid={ramBytesValid}
						id="ram-bytes-input"
						placeholder="RAM (Bytes)"
						min={manager.ramBytesMin}
					/>
				</fieldset>
			{/if}

			<div class="border-warning/30 bg-warning/5 rounded-xl border p-4">
				{#if useCurrentKeys}
					<p class="text-on-surface text-sm font-medium">Wallet Setup May Be Required</p>
					<p class="text-muted mt-1 text-xs leading-relaxed">
						Some wallets will automatically detect the new account since it shares keys with
						<strong class="text-on-surface-variant"
							><AccountText name={context.account.name} /></strong
						>. Others may require you to manually import
						<strong class="text-on-surface-variant">{manager.bidName}</strong> using your wallet's account
						import feature. This varies by wallet.
					</p>
				{:else}
					<p class="text-on-surface text-sm font-medium">Wallet Setup Required</p>
					<p class="text-muted mt-1 text-xs leading-relaxed">
						Since you are using custom keys, you will need to import
						<strong class="text-on-surface-variant">{manager.bidName}</strong> into your wallet using
						the corresponding private keys. Make sure you have access to the private keys for the public
						keys entered above.
					</p>
				{/if}
			</div>

			<Button disabled={!manager.canClaim} onclick={() => manager.transact()} variant="primary">
				Create Account
			</Button>
		</Stack>
	{/if}
</Stack>
