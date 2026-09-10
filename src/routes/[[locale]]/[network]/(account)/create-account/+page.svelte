<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, Card, Chip, Stack, cn } from '@wharfkit/svelte-components';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { supportsAccountCreation } from '$lib/wharf/plugins';

	const context = getContext<UnicoveContext>('state');

	type PathId = 'anchor' | 'contract' | 'direct';

	interface CreationPath {
		id: PathId;
		heading: string;
		actionLabel: string;
		description: string;
		requirement: string;
		advanced?: boolean;
		href?: string;
		action?: () => Promise<void>;
	}

	let creating = $state(false);
	let failed = $state(false);

	async function createWithAnchor() {
		creating = true;
		failed = false;
		try {
			await context.wharf.login({
				chain: context.network.chain.id,
				walletPlugin: 'anchor',
				arbitrary: { anchor: { mode: 'web' } }
			});
			goto(context.urlPath('/welcome'));
		} catch (error) {
			console.error('Account creation login failed:', error);
			creating = false;
			failed = true;
		}
	}

	async function connectWallet() {
		try {
			await context.wharf.login();
		} catch (error) {
			console.error('Wallet connection cancelled:', error);
		}
	}

	const paths: CreationPath[] = $derived.by(() => {
		const items: CreationPath[] = [];
		if (supportsAccountCreation(context.network.chain.id)) {
			items.push({
				id: 'anchor',
				heading: 'Create with Anchor',
				actionLabel: 'Sign up with Anchor',
				description: `Anchor opens in a new window to create your account, and secures it on your device.`,
				requirement: 'Start with an email address',
				action: createWithAnchor
			});
		}
		if (context.network.supports('createcontract')) {
			items.push({
				id: 'contract',
				heading: 'Create by sending tokens',
				actionLabel: 'Send tokens to create',
				description: `You create the keys first in a wallet and save them somewhere safe, then send tokens from an exchange to create the account.`,
				requirement: 'Start with tokens and your own keys',
				advanced: true,
				href: context.urlPath('/create-account/contract')
			});
		}
		const signedIn = !!context.wharf.session;
		items.push({
			id: 'direct',
			heading: 'Create from your existing account',
			actionLabel: signedIn ? 'Use your existing account' : 'Connect Wallet',
			description: `Create another account and pay for its storage from the account you're signed in with.`,
			requirement: 'Start with an account you already use',
			href: signedIn ? context.urlPath('/create-account/direct') : undefined,
			action: signedIn ? undefined : connectWallet
		});
		return items;
	});

	const recommendedId: PathId = $derived(context.wharf.session ? 'direct' : 'anchor');

	const featured = $derived(paths.find((path) => path.id === recommendedId) ?? paths[0]);
	const alternatives = $derived(paths.filter((path) => path !== featured));
</script>

{#snippet control(path: CreationPath, variant: 'primary' | 'outlined', className: string)}
	{#if path.action}
		<Button
			{variant}
			onclick={path.action}
			disabled={creating}
			aria-busy={path.id === 'anchor' && creating ? 'true' : undefined}
			class={className}
		>
			{#if path.id === 'anchor' && creating}
				Waiting for Anchor...
			{:else}
				{path.actionLabel}
			{/if}
		</Button>
	{:else}
		<Button
			{variant}
			href={path.href}
			aria-disabled={creating ? 'true' : undefined}
			tabindex={creating ? -1 : undefined}
			class={cn(className, creating && 'pointer-events-none opacity-50')}
		>
			{path.actionLabel}
		</Button>
	{/if}
{/snippet}

{#snippet chips(path: CreationPath, chipClass: string)}
	<div class="flex flex-wrap items-center gap-2">
		<Chip class={chipClass}>{path.requirement}</Chip>
		{#if path.advanced}
			<Chip class="ring-outline bg-transparent ring-1">Advanced</Chip>
		{/if}
	</div>
{/snippet}

{#snippet anchorFailed()}
	<p class="text-error text-sm" role="alert">
		Anchor did not finish creating your account. If you never saw the Anchor window, allow popups
		for this site and try again.
	</p>
{/snippet}

<Stack class="gap-8">
	<p class="text-on-surface-variant max-w-prose">
		Creating an account reserves a name and a small amount of storage on the network, so it costs a
		little. Every option produces the same kind of account. They differ in what you need before you
		start.
	</p>

	{#if featured}
		<Card class="bg-surface-container-highest ring-outline gap-4 p-6 ring-1 sm:p-8">
			<Stack class="gap-3">
				<span class="text-primary text-sm font-medium">Recommended for you</span>
				<h2 class="text-headline max-w-prose leading-tight text-balance">{featured.heading}</h2>
				<p class="text-on-surface-variant max-w-prose text-pretty">{featured.description}</p>
				{@render chips(featured, 'bg-surface-container-low')}
				{#if featured.id === 'anchor' && failed}
					{@render anchorFailed()}
				{/if}
			</Stack>
			{@render control(featured, 'primary', 'mt-2 w-full sm:w-auto sm:justify-self-start')}
		</Card>
	{/if}

	{#if alternatives.length}
		<div class="grid gap-4 {alternatives.length > 1 ? 'sm:grid-cols-2' : ''}">
			{#each alternatives as path (path.id)}
				<Card class="flex flex-col gap-3">
					<h2 class="text-title leading-snug text-balance">{path.heading}</h2>
					<p class="text-on-surface-variant max-w-prose text-sm text-pretty">{path.description}</p>
					{@render chips(path, '')}
					{#if path.id === 'anchor' && failed}
						{@render anchorFailed()}
					{/if}
					{@render control(path, 'outlined', 'mt-auto grow-0')}
				</Card>
			{/each}
		</div>
	{/if}
</Stack>
