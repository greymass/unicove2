<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import CompassIcon from '@lucide/svelte/icons/compass';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import XIcon from '@lucide/svelte/icons/x';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import AccountSwitcher from '$lib/components/accountswitch.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import SchemeToggle from '$lib/components/select/scheme.svelte';
	import Search from '$lib/components/search/input.svelte';
	import Unicovelogo from '$lib/assets/unicovelogo.svelte';
	import { cn } from '$lib/utils/style';
	import { buildNavModel, type NavItem } from './model.svelte';
	import { isActive, sectionOf, type NavSection } from './section';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		network: NetworkState;
		children?: Snippet;
	}

	let { network, children }: Props = $props();

	const model = $derived(buildNavModel(context, network));
	const pathname = $derived(page.url.pathname);
	const routeSection = $derived(
		sectionOf(pathname, String(network), String(context.account?.name ?? ''))
	);
	const barItems = $derived(model.wallet.filter((item) => item.bar));

	function signIn() {
		document.getElementById('account-switcher')?.click();
	}

	function closeMenu() {
		$open = false;
	}

	const {
		elements: { trigger, overlay, content, portalled },
		states: { open }
	} = createDialog({
		preventScroll: false,
		defaultOpen: false,
		forceVisible: true
	});

	const tabClass =
		'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium select-none';

	const sectionHeaderClass =
		'text-on-surface-variant/70 mb-1 px-3 text-[11px] font-semibold tracking-[0.14em] uppercase';

	const rowClass =
		'focus-visible:outline-solar-500 flex h-9 items-center gap-3 rounded-lg px-3 leading-snug select-none focus-visible:outline';

	const idleRowClass = 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface';

	const showIcons = true;

	const activeRowClass = 'bg-primary-container text-on-primary-container';
</script>

{#snippet rowIcon(Icon?: NavItem['icon'])}
	{#if showIcons}
		{#if Icon}
			<Icon class="size-4 shrink-0" />
		{:else}
			<span class="size-4 shrink-0"></span>
		{/if}
	{/if}
{/snippet}

{#snippet navLink(item: NavItem, section?: NavSection)}
	{@const active = isActive(pathname, item, section, routeSection)}
	{#if item.signIn}
		<button
			class={cn(rowClass, idleRowClass)}
			onclick={() => {
				closeMenu();
				signIn();
			}}
		>
			{@render rowIcon(item.icon)}
			<span>{item.text}</span>
		</button>
	{:else}
		<a
			href={item.href}
			class={cn(rowClass, active ? activeRowClass : idleRowClass)}
			aria-current={active ? 'page' : undefined}
			onclick={closeMenu}
		>
			{@render rowIcon(item.icon)}
			<span>{item.text}</span>
		</a>
	{/if}
{/snippet}

{#snippet sections()}
	<menu
		class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto text-base font-medium text-nowrap"
	>
		<section class="grid gap-0.5">
			<h2 class={sectionHeaderClass}>Wallet</h2>
			{#each model.wallet as item (item.text)}
				{@render navLink(item, 'wallet')}
			{/each}
		</section>
		<section class="grid gap-0.5">
			<h2 class={sectionHeaderClass}>Explorer</h2>
			{#each model.explorer as item (item.text)}
				{@render navLink(item, 'explorer')}
			{/each}
		</section>
		<section class="mt-auto grid gap-0.5 pt-3 pb-4">
			{#each model.global as item (item.text)}
				{@render navLink(item)}
			{/each}
			<div class={cn(rowClass, 'text-on-surface-variant justify-between')}>
				<span class="flex items-center gap-3">
					{@render rowIcon(MoonIcon)}
					<span>Dark mode</span>
				</span>
				<SchemeToggle />
			</div>
			<div class={cn(rowClass, idleRowClass)}>
				{@render rowIcon(LanguagesIcon)}
				<LanguageSelect
					class="h-auto flex-1 justify-between border-0 p-0 hover:opacity-100 focus:border-transparent"
				/>
			</div>
		</section>
	</menu>
{/snippet}

<div
	data-theme={network}
	class="mx-auto grid h-full min-h-svh w-[calc(100%-2rem)] max-w-(--breakpoint-2xl) grid-cols-2 grid-rows-[min-content_minmax(0,1fr)] gap-y-6 pt-4 [--shell-ctl:0px] sm:grid-cols-4 md:h-auto md:min-h-svh md:grid-cols-[12rem_repeat(10,minmax(0,1fr))] md:grid-rows-[min-content_minmax(0,1fr)] md:gap-x-4 md:[--shell-ctl:14rem] lg:grid-cols-[14rem_repeat(10,minmax(0,1fr))] lg:[--shell-ctl:26rem] xl:w-[calc(100%-6rem)]"
>
	<aside
		class="relative row-span-full row-start-1 hidden h-full md:col-start-1 md:col-end-2 md:block"
	>
		<nav
			class="sticky top-4 row-span-2 -ml-3 flex h-[calc(100svh-1rem)] flex-col content-start gap-6 pr-6"
		>
			<a href={context.urlPath('/')} class="grid h-12 items-center px-3" aria-label="home">
				<Unicovelogo small class="items-start" />
			</a>
			{@render sections()}
		</nav>
	</aside>

	<header
		class="col-span-full row-start-1 flex h-12 items-center justify-between md:pointer-events-none md:z-10 md:col-start-2 md:col-end-12"
	>
		<a href={context.urlPath('/')} class="grid h-12 items-center md:hidden" aria-label="home">
			<Unicovelogo small />
		</a>

		<div
			class="flex items-center justify-end gap-4 sm:col-start-4 md:col-span-full md:col-start-9 md:ml-auto md:w-(--shell-ctl) md:gap-4"
		>
			<Search class="pointer-events-auto shrink-0 lg:max-w-56 lg:flex-1" />
			<span class="pointer-events-auto flex items-center">
				<AccountSwitcher {network} />
			</span>
		</div>
	</header>

	<main
		class="col-span-full col-start-1 row-span-full row-start-2 grid grid-cols-subgrid content-start gap-x-4 pb-24 *:col-span-full md:col-start-2 md:col-end-12 md:row-start-1 md:px-0 md:pb-12"
	>
		{@render children?.()}
	</main>
</div>

{#snippet barTab(item: NavItem)}
	{@const active = isActive(pathname, item, 'wallet', routeSection)}
	{@const Icon = item.icon}
	<a
		href={item.href}
		class={cn(tabClass, active ? 'text-primary' : 'text-on-surface-variant')}
		aria-current={active}
	>
		{#if Icon}<Icon class="size-5" />{/if}
		<span>{item.text}</span>
	</a>
{/snippet}

<nav
	class="bg-surface-container border-outline-variant fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
>
	<div class="flex h-16 items-stretch justify-around">
		{#if !context.account}
			<button class={cn(tabClass, 'text-on-surface-variant')} onclick={signIn}>
				<LogInIcon class="size-5" />
				<span>Sign in</span>
			</button>
		{/if}
		{#each barItems as item (item.text)}
			{@render barTab(item)}
		{/each}
		<a
			href={context.urlPath('/network')}
			class={cn(tabClass, routeSection === 'explorer' ? 'text-primary' : 'text-on-surface-variant')}
			aria-current={routeSection === 'explorer'}
		>
			<CompassIcon class="size-5" />
			<span>Explorer</span>
		</a>
		<button
			class={cn(tabClass, 'text-on-surface-variant')}
			use:melt={$trigger}
			aria-label="open menu"
		>
			<MenuIcon class="size-5" />
			<span>Menu</span>
		</button>
	</div>
</nav>

{#if $open}
	<div class="md:hidden" use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="bg-scrim fixed inset-0 z-99"
			transition:fade={{ duration: 150 }}
		></div>
		<nav
			use:melt={$content}
			class="bg-surface-container fixed top-0 left-0 z-99 grid h-svh w-72 grid-rows-[auto_1fr] gap-6 overflow-y-auto px-5 pt-4 pb-4 shadow-lg focus:outline-hidden"
			transition:fly={{ x: -350, duration: 300, opacity: 1 }}
		>
			<div class="flex items-center justify-between gap-2">
				<a href={context.urlPath('/')} class="px-3" onclick={closeMenu} aria-label="home">
					<Unicovelogo wordmark />
				</a>
				<button
					class="text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-solar-500 rounded-lg p-2 focus-visible:outline"
					onclick={closeMenu}
					aria-label="close menu"
				>
					<XIcon class="size-5" />
				</button>
			</div>
			{@render sections()}
		</nav>
	</div>
{/if}
