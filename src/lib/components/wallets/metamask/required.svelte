<script lang="ts">
	import { getContext, type Snippet } from 'svelte';

	import { requestSnap } from '$lib/metamask-snap';
	import MetaMaskSnap from '$lib/components/wallets/metamask/snap.svelte';
	import type { MetaMaskState } from '$lib/state/metamask.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import MetaMaskInstall from '$lib/components/wallets/metamask/install.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import { Button } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');

	type States = 'install' | 'snap' | 'children';
	let state: States = $derived(deriveState(context.metamask));

	function deriveState(metamask: MetaMaskState): States {
		if (!metamask.snapsDetected) {
			return 'install';
		} else if (!metamask.isInstalled) {
			return 'snap';
		}
		return 'children';
	}

	interface Props {
		callback: () => void;
		children: Snippet;
	}

	let { callback, children }: Props = $props();

	const networkName = context.network.chain.name || '';
	const productName = context.network.config.metamask?.name || '';

	async function connect() {
		await requestSnap(context.metamask);
	}
</script>

<Box class="grid content-start justify-items-start gap-4 py-8 text-pretty *:shrink">
	{#if state === 'install'}
		<MetaMaskInstall {networkName} {productName} />
	{:else if state === 'snap'}
		<MetaMaskSnap {connect} {networkName} {productName} />
	{:else}
		{@render children()}
		<Button onclick={callback}>Next</Button>
	{/if}
</Box>
