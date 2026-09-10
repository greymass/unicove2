<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import UnicoveWordmark from '$lib/assets/unicove-wordmark.svelte';
	import bgDesktop from '$lib/assets/hero/eos/bg1@2x.png?enhanced';
	import bgMobile from '$lib/assets/hero/eos/bg2@2x.png?enhanced';
	import jungle4 from '$lib/assets/hero/jungle4/logo.svg';
	import telos from '$lib/assets/hero/telos/logo.svg';
	import kylin from '$lib/assets/hero/kylin/logo.webp';
	import vaultaLogo from '$lib/assets/hero/vaulta/vector.svg';
	import waxLight from '$lib/assets/hero/wax/light.png?enhanced';
	import waxDark from '$lib/assets/hero/wax/dark.png?enhanced';
	import UnicoveOutline from '$lib/assets/unicove-outline.svg';

	import { Button } from '@wharfkit/svelte-components';
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { supportsAccountCreation } from '$lib/wharf/plugins';

	interface Props {
		networkName: string;
		networkShortname: string;
	}

	let { networkName, networkShortname }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const showCreateAccount = supportsAccountCreation(context.network.chain.id);

	let creating = $state(false);

	async function createAccount() {
		creating = true;
		try {
			await context.wharf.login({
				chain: context.network.chain.id,
				walletPlugin: 'anchor',
				arbitrary: { anchor: { mode: 'web' } }
			});
			goto(context.urlPath('/welcome'));
		} catch (error) {
			console.error('Account creation login failed:', error);
		} finally {
			creating = false;
		}
	}

	let darkMode = $state(browser && localStorage.getItem('color-scheme') === 'dark');

	const logo = {
		vaulta: vaultaLogo,
		telos: telos,
		jungle4: jungle4,
		kylin: kylin
	};
</script>

{#if networkShortname === 'eos'}
	{@render eos()}
{:else if networkShortname === 'vaulta'}
	{@render vaulta()}
{:else if networkShortname === 'wax'}
	{@render wax()}
{:else}
	<section id="hero" class="grid gap-y-14 pt-6 md:grid-cols-2 md:items-center">
		<div class="row-start-1 flex justify-center">
			<div id="network-logo" class="relative size-[256px]">
				<!-- Unicove Outline -->
				<img
					class="relative size-3/4 object-contain"
					src={UnicoveOutline}
					alt={networkName}
					fetchpriority="high"
					loading="eager"
					height="512"
					width="512"
				/>

				<!-- Network Logo -->
				<img
					class="absolute right-0 bottom-0 size-3/4 object-contain"
					src={logo[networkShortname as keyof typeof logo]}
					alt={networkShortname}
					fetchpriority="high"
					loading="eager"
					height="512"
					width="512"
				/>
			</div>
		</div>

		<div class="z-10 grid gap-5 md:col-start-1 md:row-start-1">
			{@render textblock()}
		</div>
	</section>
{/if}

{#snippet textblock()}
	<Stack class="grid gap-5">
		<UnicoveWordmark class="h-7 w-auto md:h-auto" />
		<h1 class="text-3xl leading-tight font-bold text-balance lg:text-4xl lg:leading-tight">
			<span class="sr-only">Unicove -</span>
			The {networkName} web wallet and block explorer
		</h1>
		<p class="text-muted mb-2 text-xl leading-tight text-balance lg:text-xl lg:leading-tight">
			Stake, Send, Manage Tokens, and Explore {networkName} – all with ease
		</p>
		{#if showCreateAccount}
			<div class="flex flex-wrap gap-3">
				<Button variant="primary" onclick={createAccount} disabled={creating}>
					{creating ? 'Waiting for Anchor...' : 'Create account'}
				</Button>
				<Button variant="secondary" href="https://anchorwallet.io">Get Anchor Wallet</Button>
			</div>
		{/if}
	</Stack>
{/snippet}

{#snippet eos()}
	<section id="hero" class="col-span-full grid grid-cols-subgrid gap-y-14 pt-6 md:items-center">
		<!-- Desktop background for EOS -->
		<div id="hero-background" class="col-span-full row-start-1 hidden md:dark:block">
			<enhanced:img
				class="h-auto w-auto object-contain"
				src={bgDesktop}
				alt=""
				fetchpriority="high"
				loading="eager"
			/>
		</div>

		<picture
			id="network-logo"
			class="relative col-span-full row-start-1 -ml-4 grid w-screen place-items-center md:col-start-7 md:ml-0 md:w-auto xl:col-start-6"
		>
			<!-- Network Logo -->
			<img
				class="z-10 w-[41%] max-w-72 object-contain md:w-full"
				src={logo[networkShortname as keyof typeof logo]}
				alt={networkName}
				fetchpriority="high"
				loading="eager"
				height="512"
				width="512"
			/>

			<!-- Mobile background on EOS -->
			<enhanced:img
				class="absolute top-0 left-1/2 hidden -translate-x-1/2 object-contain md:hidden dark:block dark:md:hidden"
				src={bgMobile}
				alt=""
				fetchpriority="high"
				loading="eager"
			/>
		</picture>

		<div
			class="z-10 col-span-full grid gap-5 md:col-span-5 md:col-start-1 md:row-start-1 lg:col-span-4 lg:col-start-1 xl:col-start-2"
		>
			{@render textblock()}
		</div>
	</section>
{/snippet}

{#snippet wax()}
	<section
		id="hero"
		class="relative col-span-full grid grid-cols-2 gap-y-6 overflow-x-clip pt-6 pt-24 md:items-center"
	>
		<div
			id="network-logo"
			class="relative col-span-full md:col-span-1 md:col-start-2 md:row-start-1"
		>
			<!-- Unicove Outline -->
			<img
				class="relative size-3/4 object-contain md:hidden"
				src={UnicoveOutline}
				alt={networkName}
				fetchpriority="high"
				loading="eager"
				height="512"
				width="512"
			/>

			<!-- Wax Logo -->
			{#if darkMode}
				<enhanced:img
					class="absolute inset-y-0 right-0 size-full object-contain md:relative"
					src={waxDark}
					alt={networkName}
					fetchpriority="high"
					loading="eager"
				/>
			{:else}
				<enhanced:img
					class="absolute inset-y-0 right-0 size-full object-contain md:relative"
					src={waxLight}
					alt={networkName}
					fetchpriority="high"
					loading="eager"
				/>
			{/if}
		</div>

		<div
			class="col-span-full col-start-1 row-start-2 max-w-xl md:col-span-1 md:col-start-1 md:row-start-1"
		>
			{@render textblock()}
		</div>
	</section>
{/snippet}

{#snippet vaulta()}
	<section
		id="hero"
		class="@container col-span-full grid h-[70svh] max-h-156 place-content-center sm:pt-12 md:pt-0"
	>
		<Stack class="relative grid justify-items-center gap-5  text-center">
			<svg
				class="z-50 mb-2 h-auto w-64"
				width="81"
				height="33"
				viewBox="0 0 81 33"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M53.9058 8.10812H42.9195C42.4884 8.10812 42.0742 8.27376 41.7692 8.56834L16.4699 33H0V9.47065L9.79565 0.00043682V26.2295H11.1953L36.759 1.54238C37.7818 0.554629 39.1685 0 40.6146 0H53.9058V8.10855V8.10812ZM81 0H64.5297L39.2308 24.4312C38.9258 24.7258 38.5116 24.8912 38.0805 24.8912H27.0942V32.9996H40.3739C41.8274 32.9996 43.2214 32.4423 44.2487 31.4495L69.8042 6.77093H71.2039V28.9321H55.4209V33H71.2039L72.6579 31.5944L74.0137 30.2837L81 23.5298V0Z"
					fill="currentColor"
				/>
			</svg>

			<h1
				class="font-sans-hero max-w-128 text-3xl leading-tight font-bold text-balance lg:text-4xl lg:leading-tight"
			>
				<span class="">Unicove -</span>
				The {networkName} web wallet and block explorer.
			</h1>
			<p
				class="text-muted mb-2 max-w-md rounded-lg text-xl leading-tight text-pretty lg:text-xl lg:leading-tight"
			>
				Stake, Send, Manage Tokens, and Explore {networkName} – all with ease
			</p>

			<div class="flex flex-wrap justify-center gap-3">
				{#if showCreateAccount}
					<Button variant="primary" onclick={createAccount} disabled={creating}>
						{creating ? 'Waiting for Anchor...' : 'Create account'}
					</Button>
					<Button variant="secondary" href="https://anchorwallet.io">Get Anchor Wallet</Button>
				{/if}
			</div>
		</Stack>
	</section>
{/snippet}
