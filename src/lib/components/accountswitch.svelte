<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { type NameType } from '@wharfkit/antelope';
	import {
		Session,
		type LoginOptions,
		type SerializedSession,
		type WalletPlugin
	} from '@wharfkit/session';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { supportsAccountCreation } from '$lib/wharf/plugins';

	import X from '@lucide/svelte/icons/x';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import LogOut from '@lucide/svelte/icons/log-out';
	import User from '@lucide/svelte/icons/user';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Search from '@lucide/svelte/icons/search';
	import { Button } from '@wharfkit/svelte-components';
	import { TextInput } from '@wharfkit/svelte-components';
	import { Wallet } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	const context = getContext<UnicoveContext>('state');
	const urlPath = $derived(context.urlPath);

	interface PageProps {
		network: NetworkState;
	}

	let { network }: PageProps = $props();

	let currentSession = $derived(context.wharf.session);

	let filterValue = $state('');
	let addingAccount = $state(false);

	let chainSessions = $derived.by(() => {
		let sessions = context.wharf.sessions.filter((session) =>
			network.chain.id.equals(session.chain)
		);

		if (filterValue) {
			sessions = sessions.filter((session) => session.actor.toString().includes(filterValue));
		}

		return sessions;
	});

	const resetAddingAccount: CreateDialogProps['onOpenChange'] = ({ next }) => {
		addingAccount = false;
		return next;
	};

	const {
		elements: { trigger, overlay, content, close, portalled },
		states: { open }
	} = createDialog({
		// defaultOpen: true, // dev only
		preventScroll: false,
		onOpenChange: resetAddingAccount
	});

	let logo = $derived(context.network.config.logo || '');

	function closeDrawer() {
		$open = false;
		addingAccount = false;
	}

	function addAccount() {
		addingAccount = true;
	}

	function redirect(account: NameType) {
		if (!context.settings.data.preventAccountPageSwitching) {
			goto(urlPath(`/${network}/account/${account}`));
		}
	}

	function switchSession(session: SerializedSession) {
		context.wharf.switch(session);
		redirect(session.actor);
		closeDrawer();
	}

	async function removeSession(session?: Session | SerializedSession) {
		if (session) {
			await context.wharf.logout(session);
			if (currentSession) {
				redirect(currentSession.actor);
			}
		}
	}

	async function connectWallet(wallet: WalletPlugin) {
		const options: LoginOptions = {
			walletPlugin: wallet.id
		};
		if (wallet.id !== 'cleos' && wallet.id !== 'wallet-plugin-multisig') {
			options.chain = context.network.chain.id;
		}
		const session = await context.wharf.login(options);
		redirect(session.actor);
		closeDrawer();
	}

	function closeAddingAccount() {
		if (addingAccount) {
			addingAccount = false;
		} else {
			closeDrawer();
		}
	}

	function clearFilter() {
		filterValue = '';
	}

	// function removeAllSessions() {
	// 	context.wharf.logout();
	// 	closeDrawer();
	// }
</script>

<!-- Trigger Button -->
{#if context.wharf.session}
	<Button
		variant="outlined"
		class="md:bg-surface h-10 grow-0 px-0"
		meltAction={trigger}
		aria-label="account-switcher-label"
		id="account-switcher"
	>
		<div class="flex items-center gap-2 pr-4 pl-3.5">
			<picture class="size-5">
				<img
					src={String(logo)}
					alt={context.wharf.session.chain.name}
					class="size-full object-contain"
					height="20"
					width="20"
				/>
			</picture>
			<span class="text-on-primary-container pointer-events-none z-10"
				>{context.wharf.session.actor}</span
			>
		</div>
	</Button>
{:else}
	<Button
		class="h-10 grow-0 px-4"
		meltAction={trigger}
		aria-label="account-switcher-label"
		id="account-switcher"
	>
		Connect Wallet
	</Button>
{/if}

{#if $open}
	<div data-theme={network} class="" use:melt={$portalled}>
		<!-- Scrim -->
		<div
			use:melt={$overlay}
			class="bg-scrim fixed inset-0 z-50"
			transition:fade={{ duration: 150 }}
		></div>

		<!-- Content -->
		<div
			use:melt={$content}
			class="bg-surface-container fixed top-0 right-0 z-50 flex h-svh max-w-fit min-w-80 flex-col space-y-4 overflow-x-hidden overflow-y-auto px-4 py-4 shadow-lg focus:outline-hidden md:px-6"
			transition:fly={{
				x: 350,
				duration: 300,
				opacity: 1
			}}
		>
			<header class="flex items-center justify-start gap-2 py-3 pl-2 md:gap-3">
				{#if logo}
					<picture class="flex size-10 justify-center">
						<img
							src={String(logo)}
							class="h-full object-contain"
							alt={String(currentSession?.chain.name)}
						/>
					</picture>
				{/if}

				<span class="m-0 flex-1 text-xl leading-none font-bold text-ellipsis md:text-2xl">
					{network.chain.name}
				</span>

				<button
					use:melt={$close}
					aria-label="Close"
					class="text-muted focus:text-on-surface grid size-12 appearance-none place-items-center justify-self-end rounded-lg focus:outline-hidden"
				>
					<X class="size-4" />
				</button>
			</header>

			<section id="content" class="grid">
				{#if chainSessions.length && !addingAccount}
					<div
						id="accounts"
						class="col-start-1 row-start-1 grid content-start gap-4"
						in:fly={{ x: -100, duration: 100 }}
						out:fly={{ x: -100, duration: 100 }}
					>
						<Button onclick={addAccount} variant="secondary" class="text-on-surface grow-0">
							<div class="flex items-center gap-2">
								<UserPlus class="mb-0.5 size-5" />
								<span>Add Account</span>
							</div>
						</Button>

						<header class="grid gap-3 pt-2 text-xl font-semibold">
							<span>My Accounts</span>

							<!-- Filter or Search accounts -->
							{#if chainSessions.length > 4 || filterValue}
								<TextInput
									class="rounded-full bg-transparent pl-6 text-sm"
									placeholder="Filter accounts"
									bind:value={filterValue}
								>
									{#if filterValue}
										<button onclick={clearFilter} class="grid place-items-center">
											<CircleX class="size-4" />
										</button>
									{:else}
										<Search class="size-4" />
									{/if}
								</TextInput>
							{/if}
						</header>

						<ul class="grid gap-2">
							{#each chainSessions as session}
								{@const isCurrent =
									currentSession?.actor.equals(session.actor) &&
									currentSession?.permission.equals(session.permission)}
								<li class="grid grid-cols-[1fr_auto] gap-2">
									<button
										data-current={isCurrent}
										onclick={() => switchSession(session)}
										class="text-on-surface-variant data-[current=false]:hover:bg-surface-container-high data-[current=false]:hover:text-on-surface data-[current=true]:bg-primary data-[current=true]:text-on-primary flex h-12 items-center gap-1 rounded-lg px-4"
									>
										<div class="w-6">
											{#if isCurrent}
												<UserCheck class="ml-0.5 size-4 stroke-2" />
											{:else}
												<User class="size-4" />
											{/if}
										</div>

										<div class="flex flex-col gap-px text-left font-medium">
											<span class="leading-none">{session.actor}@{session.permission}</span>
											{#if session.walletPlugin.id === 'wallet-plugin-multisig'}
												<div class="text-xs font-normal">
													↳ multisig using {session.walletPlugin.data.session.actor}
												</div>
											{/if}
										</div>
									</button>
									<button
										onclick={() => removeSession(session)}
										data-current={isCurrent}
										class="text-muted hover:bg-surface-container-high hover:text-on-surface grid size-12 place-items-center rounded-lg"
									>
										<LogOut class="size-4" />
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{:else}
					<div class="col-start-1 row-start-1">
						{@render connectWalletScreen()}
					</div>
				{/if}
			</section>
		</div>
	</div>
{/if}

{#snippet connectWalletScreen()}
	<div class="space-y-4" in:fly={{ x: 100, duration: 150 }} out:fly={{ x: 100, duration: 100 }}>
		<hr class="border-outline" />

		<header class="grid justify-center gap-4 py-4 text-center">
			<span class="text-title">Login to Unicove</span>
			<span class="text-muted text-sm font-medium">Connect your wallet to login</span>
		</header>

		{#if context.wharf.sessionKit}
			<ul class="grid grid-cols-[auto_1fr_auto]">
				{#each context.wharf.sessionKit?.walletPlugins as wallet}
					{#if wallet.id !== 'wallet-plugin-multisig'}
						<li class="table-row-background table-row-border col-span-full grid grid-cols-subgrid">
							<button
								class="text-on-surface col-span-full grid grid-cols-subgrid gap-4 px-2 py-4 font-semibold"
								onclick={() => connectWallet(wallet)}
							>
								{#if wallet.metadata.logo}
									<img
										class="size-6"
										src={wallet.metadata.logo.toString()}
										alt={wallet.metadata.name}
									/>
								{:else}
									<Wallet class="size-6" />
								{/if}
								<span class="text-left">{wallet.metadata.name}</span>
							</button>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
		<div class="grid gap-2">
			{#if supportsAccountCreation(network.chain.id)}
				<Button href={urlPath('/signup')} onclick={closeDrawer} variant="primary">
					Create account
				</Button>
			{/if}
			<Button class="text-on-surface" onclick={closeAddingAccount} variant="secondary"
				>Cancel</Button
			>
		</div>
	</div>
{/snippet}
