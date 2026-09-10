<script lang="ts">
	import { Stack, Button } from '@wharfkit/svelte-components';

	interface Props {
		networkName: string;
		productName: string;
	}

	let { networkName, productName }: Props = $props();
</script>

<h2 class="text-xl font-semibold">Add {productName} to MetaMask</h2>
<Stack class="mb-1 gap-2">
	<p class="leading-snug">
		The {productName} snap allows you to interact with Unicove and other {networkName}-based dApps
		using MetaMask.
	</p>
	<p class="leading-snug">
		Begin by installing MetaMask, then come back to this page and install the {productName} snap.
	</p>
</Stack>
<Button href={'https://metamask.io/download/'} blank>Install MetaMask</Button>
<p class="text-xs text-balance">
	Note: If MetaMask is already installed, you may need to grant permissions for Unicove by manually
	opening MetaMask.
</p>
