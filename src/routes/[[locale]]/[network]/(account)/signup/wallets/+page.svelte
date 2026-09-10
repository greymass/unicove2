<script lang="ts">
	import { getContext } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { Stack } from '@wharfkit/svelte-components';
	import type { WalletPlugin } from '@wharfkit/session';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { baseWalletPlugins } from '$lib/wharf/plugins';

	const context = getContext<UnicoveContext>('state');

	type FormFactor = 'extension' | 'mobile' | 'desktop' | 'web';

	interface WalletTraits {
		formFactors: FormFactor[];
		custody: 'self' | 'custodial';
		createsAccounts: boolean;
		path?: string;
	}

	// Descriptive overlay for what plugin metadata lacks, keyed by plugin id
	const traitsById: Record<string, WalletTraits> = {
		anchor: { formFactors: ['desktop', 'mobile'], custody: 'self', createsAccounts: true },
		cloudwallet: { formFactors: ['web'], custody: 'custodial', createsAccounts: true },
		imtoken: { formFactors: ['mobile'], custody: 'self', createsAccounts: false },
		'wallet-plugin-metamask': {
			formFactors: ['extension'],
			custody: 'self',
			createsAccounts: true,
			path: '/metamask'
		},
		scatter: { formFactors: ['desktop'], custody: 'self', createsAccounts: false },
		tokenpocket: { formFactors: ['mobile'], custody: 'self', createsAccounts: false },
		gatewallet: { formFactors: ['mobile', 'web'], custody: 'custodial', createsAccounts: false }
	};

	// Wombat remains available for login but is no longer recommended to new users
	const excluded = ['wallet-plugin-privatekey', 'privatekey', 'wombat'];

	const wallets = $derived(
		baseWalletPlugins.filter((plugin) => {
			if (excluded.includes(plugin.id)) return false;
			const chains = plugin.config.supportedChains;
			return !chains || chains.map(String).includes(String(context.network.chain.id));
		})
	);

	function destination(plugin: WalletPlugin): string {
		const path = traitsById[plugin.id]?.path;
		if (path) {
			return context.urlPath(path);
		}
		return String(plugin.metadata.download || plugin.metadata.homepage || '');
	}

	function isExternal(plugin: WalletPlugin): boolean {
		return !traitsById[plugin.id]?.path;
	}

	const chipClass =
		'border-outline-variant text-on-surface-variant rounded-full border px-2 py-0.5';
</script>

<Stack class="gap-2">
	<h3 class="text-title">Compatible wallets</h3>
	<p>
		Any of these wallets can be used with {context.network.chain.name} and Unicove. Install one, then
		return here and sign in with it.
	</p>
</Stack>

<Stack class="gap-4">
	{#each wallets as wallet (wallet.id)}
		{@const traits = traitsById[wallet.id]}
		<a
			href={destination(wallet)}
			target={isExternal(wallet) ? '_blank' : undefined}
			rel={isExternal(wallet) ? 'noopener noreferrer' : undefined}
			class="group hover:bg-surface-container-high focus-visible:ring-solar-500 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/20 p-4 focus-visible:ring-2 focus-visible:outline focus-visible:outline-transparent"
		>
			<div class="bg-surface-container-high grid size-12 place-items-center rounded-full">
				{#if wallet.metadata.logo}
					<img
						src={String(wallet.metadata.logo)}
						alt={wallet.metadata.name}
						class="size-8 object-contain"
					/>
				{/if}
			</div>
			<div class="space-y-2">
				<h4 class="text-xl font-semibold">{wallet.metadata.name}</h4>
				{#if wallet.metadata.description}
					<p class="text-on-surface-variant text-sm">{wallet.metadata.description}</p>
				{/if}
				{#if traits}
					<p class="flex flex-wrap gap-1.5 text-xs">
						{#if traits.formFactors.includes('extension')}
							<span class={chipClass}>Browser extension</span>
						{/if}
						{#if traits.formFactors.includes('mobile')}
							<span class={chipClass}>Mobile app</span>
						{/if}
						{#if traits.formFactors.includes('desktop')}
							<span class={chipClass}>Desktop app</span>
						{/if}
						{#if traits.formFactors.includes('web')}
							<span class={chipClass}>Web wallet</span>
						{/if}
						{#if traits.custody === 'self'}
							<span class={chipClass}>Self-custody</span>
						{:else}
							<span class={chipClass}>Custodial</span>
						{/if}
						{#if traits.createsAccounts}
							<span class={chipClass}>Can create accounts</span>
						{/if}
					</p>
				{/if}
			</div>
			{#if isExternal(wallet)}
				<ExternalLink class="group-hover:stroke-primary size-5" />
			{:else}
				<ChevronRight class="group-hover:stroke-primary size-6" />
			{/if}
		</a>
	{/each}
</Stack>

<p class="text-muted text-sm">
	New to {context.network.chain.name}?
	<a class="text-primary" href={context.urlPath('/signup')}>Create an account instead</a>
</p>
