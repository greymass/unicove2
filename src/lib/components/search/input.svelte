<script lang="ts">
	import { getContext, onDestroy, type ComponentProps } from 'svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import type { TextInput } from '@wharfkit/svelte-components';
	import { preventDefault } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import {
		defaultRegistry,
		SearchManager,
		type SearchActionPlugin,
		type SearchRecord
	} from '$lib/state/search';
	import SearchIcon from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import { Stack } from '@wharfkit/svelte-components';
	import { cn } from '$lib/utils';
	import Result from './result.svelte';
	import { browser } from '$app/environment';
	import { ArrowRight } from '@lucide/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { goto } from '$app/navigation';

	const context = getContext<UnicoveContext>('state');

	interface NameInputProps extends ComponentProps<typeof TextInput> {
		debug?: boolean;
	}

	let { ref = $bindable(), debug = false, ...props }: NameInputProps = $props();

	let searchValue: string = $state('');
	let selectedIndex: number = $state(0);

	// Create search manager to handle sync and async searches
	const searchManager = new SearchManager(context);

	// Cleanup on component unmount
	onDestroy(() => {
		searchManager.destroy();
	});

	// Derive results from manager
	const results = $derived(searchManager.results);

	// Update manager when search value changes
	$effect(() => {
		searchManager.setQuery(searchValue);
	});

	const resetSelectedIndex: CreateDialogProps['onOpenChange'] = ({ next }) => {
		selectedIndex = 0;
		return next;
	};

	// Build the dialog element
	const {
		elements: { trigger, portalled, overlay, content },
		states: { open }
	} = createDialog({
		preventScroll: false,
		forceVisible: true,
		onOpenChange: resetSelectedIndex
	});

	function handleKeydown(event: KeyboardEvent) {
		// Focus the search input when the user presses '/' outside a text input or 'Cmd+k' anywhere
		if (
			(event.key === '/' &&
				document.activeElement?.tagName !== 'INPUT' &&
				document.activeElement?.tagName !== 'TEXTAREA' &&
				document.activeElement?.getAttribute('contenteditable') !== 'true') ||
			(event.metaKey && event.key === 'k')
		) {
			event.preventDefault();
			$open = true;
			return;
		}

		if (document.activeElement === ref) {
			if (event.metaKey && event.key === 'k') {
				closeSearch();
				return;
			}

			if (event.key === 'ArrowDown') {
				if (selectedIndex === undefined) {
					selectedIndex = 0;
					return;
				}
				// Select next context.history item
				selectedIndex = (results.length + selectedIndex + 1) % results.length;
				event.preventDefault();
				return;
			}

			if (event.key === 'ArrowUp') {
				if (selectedIndex === undefined) {
					selectedIndex = results.length;
					return;
				}
				// Select previous context.history item
				selectedIndex = (results.length + selectedIndex - 1) % results.length;
				event.preventDefault();
				return;
			}
		}
	}

	async function goToResult() {
		const result = results[selectedIndex];
		if (!result) {
			return;
		}

		// Check if this is an action (CLEAR, PAGE, etc.)
		if (result.data && typeof result.data === 'object' && 'execute' in result.data) {
			const action = result.data as SearchActionPlugin;
			await action.execute(context);
			// Check if action has onSelect handler that wants to keep dialog open
			const keepOpen = action.onSelect?.(context);
			if (keepOpen) {
				searchValue = '';
				return;
			}
			closeSearch();
			return;
		}

		// Get the plugin for this result type
		const plugin = defaultRegistry.getResultPlugin(result.type);

		// Call onSelect handler if present
		if (plugin?.onSelect) {
			const keepOpen = plugin.onSelect(result, context);
			if (keepOpen) {
				return; // Keep dialog open
			}
		}

		// Close search for normal navigation
		closeSearch();

		// Check if this result type should be saved to history (default: false)
		if (plugin?.savesToHistory) {
			context.history.add(result);
		}

		// Navigate to the URL if present
		if (result.url) {
			goto(result.url);
		}
	}

	function closeSearch() {
		$open = false;
		searchValue = '';
	}

	function getShortcutKey(): '⌘ + K' | '/' | undefined {
		if (!browser || !('navigator' in window)) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((window.navigator as any).userAgentData) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { platform } = (window.navigator as any).userAgentData;
			if (platform.startsWith('mac')) return '⌘ + K';
		} else {
			// Fallback for older browsers
			if (navigator.userAgent.indexOf('Mac') !== -1) return '⌘ + K';
		}

		return '/';
	}

	const shortcutKey = getShortcutKey();

	if (debug) {
		$inspect({
			selectedIndex,
			searchValue,
			results,
			open: $open
		});
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<button
	use:melt={$trigger}
	aria-label="search"
	id="search"
	class={cn(
		'text-muted focus-visible:ring-solar-500 focus-visible:border-solar-500 lg:border-outline lg:bg-surface  relative z-50 inline-flex h-10 items-center justify-between rounded-lg py-3.5 text-base leading-4 font-medium text-nowrap focus:outline-hidden focus-visible:ring focus-visible:ring-inset md:px-2 lg:justify-between lg:border-2  lg:py-2 lg:pr-0 lg:pl-3',
		props.class
	)}
>
	<span class="inline-flex items-center gap-2">
		<SearchIcon class="size-6 text-inherit md:size-5" />
		<span class="hidden lg:inline">
			Search {String(context.network.chain.name).slice(0, 3)}...
		</span>
	</span>

	{#if shortcutKey}
		<span class="border-outline m-2 hidden rounded-sm border px-2 py-1 lg:inline">
			{shortcutKey}
		</span>
	{/if}
</button>

{#if $open}
	<div use:melt={$portalled} data-theme={context.network}>
		<div
			use:melt={$overlay}
			class="bg-scrim fixed inset-0 z-50"
			transition:fade={{ duration: 100 }}
		></div>
		<div
			use:melt={$content}
			class="bg-surface-container fixed top-20 left-1/2 z-50 max-h-[85vh] w-[90vw] max-w-xl -translate-x-1/2 transform overflow-hidden rounded-2xl p-4 shadow-lg"
			transition:scale={{
				duration: 100,
				start: 0.95
			}}
		>
			<Stack class="gap-4">
				<form class="flex flex-col gap-2" onsubmit={preventDefault(goToResult)}>
					<div class="relative">
						<input
							type="text"
							autocorrect="off"
							autocomplete="off"
							autocapitalize="off"
							bind:this={ref}
							bind:value={searchValue}
							placeholder="Search Unicove"
							class="border-primary w-full rounded-lg border-2 bg-transparent p-4 focus:outline-hidden"
						/>

						{#if searchManager.isLoading}
							<div class="absolute inset-y-1 right-4 hidden place-items-center sm:grid">
								<svg
									class="animate-spin"
									width="20"
									height="20"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<!-- Background circle if wanted later  -->
									<!-- <circle -->
									<!-- 	cx="10" -->
									<!-- 	cy="10" -->
									<!-- 	r="9" -->
									<!-- 	fill="none" -->
									<!-- 	class="stroke-surface-container-highest" -->
									<!-- 	stroke-width="2" -->
									<!-- 	stroke-dasharray="56.55 18.85" -->
									<!-- 	stroke-dashoffset="0" -->
									<!-- /> -->

									<circle
										class="stroke-primary"
										cx="10"
										cy="10"
										r="9"
										fill="none"
										stroke-width="2"
										stroke-dasharray="14.14 56.55"
										stroke-dashoffset="0"
										transform="rotate(-90 10 10)"
									/>
								</svg>
							</div>
						{/if}
					</div>
				</form>

				<div class="table-styles grid grid-cols-[1fr_1fr] gap-x-4 sm:grid-cols-[1fr_auto_auto]">
					{#if results.length > 0}
						<div class="table-head-styles col-span-full grid grid-cols-subgrid select-none">
							{#if searchValue}
								<span class="pl-2">Search Results</span>
							{:else}
								<span class="pl-2">Recent Activity</span>
							{/if}
							<span class="text-right sm:text-left">Description</span>
							{#if !searchValue}
								<button
									class="focus-visible:outline-solar-500 hidden justify-self-end focus-visible:outline focus-visible:outline-offset-2 sm:block"
									onclick={() => searchManager.clearHistory()}
								>
									Clear
								</button>
							{/if}
						</div>
					{/if}

					{#if results.length > 0}
						<ul class="group/list col-span-full grid grid-cols-subgrid">
							{#each results as item, index}
								{#if searchValue}
									{@render ResultRow(index, item)}
								{:else}
									{@render HistoryRow(index, item)}
								{/if}
							{/each}
						</ul>
					{:else}
						<!-- No results -->
						<div class="col-span-full m-4 grid items-center justify-items-center">
							{#if searchValue}
								<span class="text-muted col-span-full text-center">No results found</span>
							{:else}
								<span class="text-muted col-span-full text-center">
									Search for Unicove features or enter an account name, public key, or transaction
									ID on the network.
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</Stack>
		</div>
	</div>
{/if}

{#snippet ResultRow(index: number, item: SearchRecord)}
	{@const active = index === selectedIndex}
	<li
		class="group/row group-has-[:hover]/list:text-muted hover:group-has-[:hover]/list:bg-surface-container-high hover:group-has-[:hover]/list:text-on-surface data-[active=true]:bg-surface-container-high data-[active=true]:text-on-surface col-span-full grid h-12 grid-cols-subgrid items-center justify-items-start rounded-lg group-has-[:hover]/list:bg-transparent focus:outline-hidden"
		data-active={active}
	>
		<Result class="col-span-2 sm:col-span-3" {active} record={item} onclick={closeSearch}>
			<div
				data-active={active}
				class="text-on-surface hidden size-12 place-items-center sm:group-hover/row:grid sm:data-[active=true]:grid sm:data-[active=true]:group-has-[:hover]/list:hidden sm:data-[active=true]:group-hover/row:group-has-[:hover]/list:grid"
			>
				<ArrowRight />
			</div>
		</Result>
	</li>
{/snippet}

{#snippet HistoryRow(index: number, item: SearchRecord)}
	{@const active = index === selectedIndex}
	<li
		class="group-has-[:hover]/list:text-muted hover:group-has-[:hover]/list:bg-surface-container-high hover:group-has-[:hover]/list:text-on-surface data-[active=true]:bg-surface-container-high data-[active=true]:text-on-surface col-span-full grid h-12 grid-cols-subgrid items-center justify-items-start rounded-lg group-has-[:hover]/list:bg-transparent focus:outline-hidden"
		data-active={active}
	>
		<Result class="col-span-2 sm:col-span-2" {active} record={item} onclick={closeSearch}></Result>
		<button
			class="text-muted focus-visible:ring-solar-500 hover:text-on-surface grid hidden size-12 place-items-center justify-self-end focus-visible:ring-3 focus-visible:outline-hidden focus-visible:ring-inset sm:block"
			onclick={() => searchManager.removeHistoryItem(index)}
		>
			<X class="text-inherit" />
		</button>
	</li>
{/snippet}
