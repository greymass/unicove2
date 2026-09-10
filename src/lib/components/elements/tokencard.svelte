<script lang="ts">
	import type { TokenBalance, TokenBalanceChild } from '$lib/types/token';
	import { Card } from '@wharfkit/svelte-components';
	interface Props {
		token?: TokenBalance | TokenBalanceChild;
		title: string;
		description: string;
	}

	const { token, title, description }: Props = $props();
</script>

<Card class="bg-surface-container-high min-h-28 p-4 text-right">
	<div class="flex items-center justify-between">
		<!-- <img src={token?.metadata.logo} class="size-6" alt="token icon" /> -->
		<h5 class="text-xl font-bold">{title}</h5>
	</div>
	<p class="*:block">
		<span class="text-on-surface">{token?.balance}</span>
		<span>{description}</span>
	</p>
</Card>
