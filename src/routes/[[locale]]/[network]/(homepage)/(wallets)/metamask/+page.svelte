<script lang="ts">
	import { getContext, onMount } from 'svelte';

	import { Button } from '@wharfkit/svelte-components';
	import Box from '$lib/components/layout/box/box.svelte';
	import { requestPublicKeys, requestSnap } from '$lib/metamask-snap';
	import MetaMaskInstall from '$lib/components/wallets/metamask/install.svelte';
	import MetaMaskSnap from '$lib/components/wallets/metamask/snap.svelte';
	import Metamask from '$lib/assets/metamask.svg';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { Cluster, Stack } from '@wharfkit/svelte-components';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';
	import { TextInput } from '@wharfkit/svelte-components';
	import { CopyButton } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { goto } from '$app/navigation';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let packageInfo: Record<string, any> = $state({});
	let latestVersion: string | undefined = $state();
	let packageName: string | undefined = $state();
	let isMetaMaskSession: boolean = $derived(
		context.wharf.session?.walletPlugin.id === 'wallet-plugin-metamask'
	);

	let currentVersion = $derived(context.metamask.installedSnap?.version);
	let needsUpdate = $derived(
		latestVersion && context.metamask.installedSnap?.version !== latestVersion
	);

	async function connect() {
		await requestSnap(context.metamask);
		await requestPublicKeys(context.metamask, context.wharf);
	}

	onMount(async () => {
		if (!data.network.snapOrigin) {
			return goto(`/404`);
		}
		await getLatestSnapVersion();
	});

	$effect(() => {
		if (context.metamask.isInstalled) {
			connect();
		}
	});

	async function getLatestSnapVersion() {
		if (!data.network.snapOrigin?.includes('npm:')) return;

		const npmPackage = data.network.snapOrigin?.split(':')[1];

		const response = await fetch(`https://registry.npmjs.org/${npmPackage}/latest`);
		packageInfo = await response.json();
		if (String(packageInfo.name).startsWith('@')) {
			packageName = packageInfo.name.slice(1);
		} else {
			packageName = packageInfo.name;
		}
		latestVersion = packageInfo.version;
	}

	async function handleUpdateSnap() {
		if (!needsUpdate) return;

		try {
			// Force install latest version by passing it explicitly
			await requestSnap(context.metamask, latestVersion);
		} catch (error) {
			console.error('Error updating snap:', error);
			alert(`Error updating the ${data.network.config.metamask?.name} snap. Please try again.`);
		}
	}

	async function login() {
		context.wharf.login({
			chain: data.network.chain.id,
			walletPlugin: 'wallet-plugin-metamask'
		});
	}

	async function createAccountAndLogin() {
		try {
			const accountCreationResponse = await context.wharf.createAccount({
				chain: data.network.chain,
				pluginId: 'account-creation-plugin-metamask'
			});
			await context.wharf.login({
				chain: accountCreationResponse.chain,
				permissionLevel: `${accountCreationResponse.accountName}@active`,
				walletPlugin: 'wallet-plugin-metamask'
			});
			await goto(context.urlPath('/welcome'));
		} catch (error) {
			console.error('Error creating account:', error);
			alert(
				`Error creating account through Metamask. Please make sure that the Antelope snap is enabled.`
			);
		}
	}

	const networkLogo = data.network.config.logo;
	const networkName = data.network.chain.name;
	const productName = data.network.config.metamask?.name || '';
</script>

<section class="@container col-span-full">
	<div class="bg-surface-container grid min-h-72 rounded-2xl px-4 @2xl:grid-cols-2 @2xl:gap-4">
		<div class="grid place-items-center">
			<svg
				class="col-start-1 row-start-1 h-full w-full object-cover"
				width="635"
				height="296"
				viewBox="0 0 635 296"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M201.577-49.292h231.851l115.925 200.789-115.925 200.788H201.577L85.652 151.497 201.577-49.292Z"
					stroke="#fff"
					stroke-opacity=".1"
				/>
				<path
					d="M179.906 13.903 367.864-36.46l137.594 137.594-50.363 187.957-187.957 50.363L129.543 201.86l50.363-187.957Z"
					stroke="#fff"
					stroke-opacity=".5"
				/>
				<path
					d="M179.009 72.29 317.506-7.424l138.497 79.712v159.422l-138.497 79.712-138.497-79.712V72.289Z"
					stroke="#fff"
				/>
			</svg>
			<div
				class="col-start-1 row-start-1 grid max-w-sm grid-cols-3 items-center justify-items-center"
			>
				<img
					class="bg-surface-container h-40 rounded-full object-contain"
					src={Metamask}
					alt="metamask"
				/>
				<svg width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18.008 0v36M36.008 18h-36" stroke="#fff" />
				</svg>
				<img
					class="bg-surface-container h-40 rounded-full object-contain px-2 py-4"
					src={String(networkLogo)}
					alt={networkName}
				/>
			</div>
		</div>

		<Box class="grid content-start justify-items-start gap-4 py-8 text-pretty *:shrink">
			{#if !context.metamask.isMetaMaskReady}
				<MetaMaskInstall {networkName} {productName} />
			{:else if currentVersion}
				<h2 class="text-xl font-semibold">{productName} + MetaMask</h2>
				{#if needsUpdate}
					<p class="mb-1 leading-snug">
						A new version of the {productName} is available. Click the button below to update to the
						latest version ({String(latestVersion)}).
					</p>
					<Button onclick={handleUpdateSnap}>Update {productName}</Button>
				{:else}
					<Stack class="mb-1 gap-2">
						<p class="leading-snug">
							MetaMask and the {productName} are connected, installed, and up-to-date using
							<a href="https://www.npmjs.com/package/{packageName}/v/{currentVersion}"
								>version {currentVersion}</a
							>.
						</p>
						{#if context.wharf.session && isMetaMaskSession}
							<p class="leading-snug">
								You are logged in as {context.wharf.session.actor} and ready to use Unicove to access
								the {networkName} network.
							</p>
						{:else if context.wharf.session}
							<p class="leading-snug">
								You are logged in as {context.wharf.session.actor} but are not using MetaMask.
							</p>
						{:else}
							<p class="leading-snug">
								If you don't already have an {networkName} account you can create one now. If you have
								already created an account you can login with MetaMask.
							</p>
						{/if}
					</Stack>
					{#if context.wharf.session}
						<Cluster>
							<Button href={context.urlPath(`/account/${context.wharf.session.actor}`)}
								>View my account</Button
							>
						</Cluster>
					{:else}
						<Cluster>
							<Button onclick={login}>Login</Button>
							<Button onclick={createAccountAndLogin}>Create an account</Button>
						</Cluster>
					{/if}
				{/if}
			{:else}
				<MetaMaskSnap {networkName} {productName} {connect} />
			{/if}
		</Box>
	</div>
</section>

{#if context.settings.data.debugMode}
	<Code
		json={{
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

{#snippet link(text: string, href: string)}
	<a {href} class="hover:text-muted underline" target="_blank">
		{text}
	</a>
{/snippet}

<div class="mt-8 flex flex-row flex-wrap gap-16">
	<section class="max-w-prose space-y-4">
		<h2 class="text-2xl font-semibold">FAQ</h2>
		<h3 class="text-md font-semibold">What is a MetaMask snap?</h3>
		<p>
			{@render link('MetaMask Snaps', 'https://metamask.io/snaps/')}
			are a new feature in MetaMask that allow community built plugins to extend the functionality of
			the wallet beyond Ethereum based blockchains. This means you can now access the {networkName}
			Network through MetaMask using the {productName} snap.
		</p>

		<h3 class="text-md font-semibold">How do I install the {productName}?</h3>
		<p>
			The {productName} is a MetaMask Snap you can install directly from this page on Unicove or from
			the {productName} page in the
			{@render link(
				'MetaMask Snaps Directory',
				`https://snaps.metamask.io/snap/npm/${packageName}`
			)}. You will need to have MetaMask installed before adding the {productName} snap.
		</p>

		<h3 class="text-md font-semibold">What does the {productName} do?</h3>
		<p>
			The {productName} allows you to use MetaMask as a web3 wallet for an {networkName} Network account.
			With it you can sign in to {networkName} apps and perform transactions.
		</p>

		<h3 class="text-md font-semibold">What does the {productName} not do?</h3>
		<p>
			The {productName}'s only purpose is to sign transactions and will need to be paired with a
			companion dApp, such as Unicove, in order to manage your account.
		</p>

		<h3 class="text-md font-semibold">How do I sign transactions using the {productName}?</h3>
		<p>
			Please see our guide on
			{@render link(
				`How to Sign Transactions on the ${networkName} network with MetaMask`,
				'https://support.greymass.com/a/solutions/articles/72000637277'
			)}
		</p>

		<h3 class="text-md font-semibold">Is the {productName} free to use?</h3>
		<p>
			Yes, the {productName} software is completely free to use. However, accounts on the {networkName}
			Network require a small amount of {networkName} before they are created.
		</p>
		<p>
			Unicove is currently covering this cost and offering one free account per user. To limit
			abuse, we require logging in with a valid 3rd party account. Only Apple and Google accounts
			are supported at this time.
		</p>
		<h3 class="text-md font-semibold">
			Where can I view and manage my {networkName} account?
		</h3>
		<p>
			Unicove is the first web wallet to allow you to manage your {networkName} account using MetaMask.
			We expect other wallets will add support in the future.
		</p>
		<p>
			You can view your account on any {networkName} Network block explorer, like Unicove, simply by
			searching for the account name.
		</p>

		<h3 class="text-md font-semibold">
			Is my private key or recovery phrase exposed when using the {productName} Snap?
		</h3>
		<p>
			The {productName} uses a private key derived from your MetaMask seed phrase using the BIP-0044
			and the {networkName} coin type. This private key is only ever used for {networkName} accounts
			and the {productName} cannot access any of your other keys. The {productName} never exposes this
			private key and does not have access to your seed phrase.
		</p>

		<h3 class="text-md font-semibold">How does MetaMask configure my owner and active keys?</h3>
		<p>
			The {productName} derives your owner and active keys from your MetaMask seed phrase using different
			indexes. The zero (0) index key is reserved for the owner key and is not available to sign regular
			transactions with, while the first (1) index key is used for the active key and available for transaction
			signing.
		</p>
		<p>
			A future update to the {productName} will provide a way to use the owner key to reset the active
			key, allowing for a recovery path in the event the active keys have been changed.
		</p>

		<h3 class="text-md font-semibold">How does find my owner and active keys?</h3>
		<p>
			The {productName} provides an RPC method which returns the public keys associated with your MetaMask
			seed phrase. These can be used when manually setting up a new account. Unicove can display these
			keys to you if you visit the Settings page and enable Advanced Mode.
		</p>

		<h3 class="text-md font-semibold">
			Can I access all {networkName} apps using {productName} for MetaMask?
		</h3>
		<p>
			It's possible to access any {networkName} Network app, provided the app developers have integrated
			the required SDKs. The {productName} and MetaMask can be added to any web app using
			{@render link('Wharf', 'https://wharfkit.com/')}
			with the
			{@render link(
				'MetaMask Wallet Plugin',
				'https://github.com/wharfkit/wallet-plugin-metamask'
			)}.
		</p>
		<p>
			Unicove itself is
			{@render link('open source', 'https://github.com/greymass/unicove')}
			and serves as reference material for how this integration can be performed.
		</p>

		<h3 class="text-md font-semibold">How do I reach out for {productName} support?</h3>
		<p>
			If you have any issues with the {productName} itself, please feel free to reach out to us at
		</p>
		<address class="text-muted inline">
			<a href="mailto:support@greymass.com">support@greymass.com</a>
		</address>
		<p class="inline">or by visiting our Support portal at:</p>
		<p>{@render link('https://support.greymass.com', 'https://support.greymass.com')}</p>
	</section>

	<div class="w-80">
		<Stack class="gap-4">
			{#if context.metamask.publicKey || context.metamask.ownerKey}
				<h2 class="text-2xl font-semibold">Your Public Keys</h2>
				{#if context.metamask.publicKey}
					<p>MetaMask Public Key (Active)</p>
					<TextInput bind:value={context.metamask.publicKey} disabled>
						<CopyButton data={String(context.metamask.publicKey)} />
					</TextInput>
				{/if}
				{#if context.metamask.ownerKey}
					<p>MetaMask Public Key (Owner)</p>
					<TextInput bind:value={context.metamask.ownerKey} disabled>
						<CopyButton data={String(context.metamask.ownerKey)} />
					</TextInput>
				{/if}
			{/if}

			<h2 class="text-2xl font-semibold">Details</h2>
			<DL>
				<DLRow title="MetaMask Snaps Directory">
					<DD>
						<a class="text-nowrap" href="https://snaps.metamask.io/snap/npm/{packageName}">
							{networkName} Wallet
						</a>
					</DD>
				</DLRow>

				<DLRow title="Source Code">
					<DD>
						<a href="https://github.com/greymass/antelope-snap/tree/{context.network}"> GitHub </a>
					</DD>
				</DLRow>
				{#if latestVersion}
					<DLRow title="Latest Version">
						<DD>
							<a href="https://www.npmjs.com/package/{packageName}?activeTab=versions">
								{latestVersion}
							</a>
						</DD>
					</DLRow>
				{/if}
			</DL>
		</Stack>
	</div>
</div>
