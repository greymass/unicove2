<script lang="ts">
	import { Stack, Button } from '@wharfkit/svelte-components';

	interface Props {
		connect: () => Promise<void>;
		networkName: string;
		productName: string;
	}

	let { connect, networkName, productName }: Props = $props();
</script>

<h2 class="text-xl font-semibold">Add {productName} to MetaMask</h2>
<Stack class="mb-1 gap-2">
	<p class="leading-snug">It looks like you already have MetaMask installed.</p>
	<p class="leading-snug">
		To get started with MetaMask on the {networkName} Network, install the {productName} snap using the
		button below.
	</p>
</Stack>
<Button onclick={connect}>Install {productName}</Button>
