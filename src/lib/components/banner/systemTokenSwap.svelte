<script lang="ts">
	import type { AccountState } from '$lib/state/client/account.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { HelpCircle } from '@lucide/svelte';
	import { Int64 } from '@wharfkit/session';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { urlPath } = getContext<UnicoveContext>('state');

	interface Props {
		account?: AccountState;
		network: NetworkState;
	}
	let props: Props = $props();
</script>

{#if props.account && props.network.config.legacytoken && props.account.getBalance(props.network.config.legacytoken) && props.account
		.getBalance(props.network.config.legacytoken)
		.balance.units.gt(Int64.from(0))}
	<aside
		class="from-primary-container to-primary-container/50 border-outline grid gap-4 rounded-lg border border-2 bg-gradient-to-br p-4 text-center"
	>
		<div class="grid gap-1">
			<a
				class="text-on-primary-container content-center text-xl leading-tight font-semibold text-balance"
				href="https://www.vaulta.com/resources/vaulta-token-swap-a-begins-may-14"
			>
				<span>
					{props.network.chain.name} now uses the {props.network.token.name} token
				</span>

				<HelpCircle class="mb-0.5 inline size-4" />
			</a>

			<p class="text-on-primary-container/80 text-sm leading-tight text-balance">
				<AssetText
					variant="full"
					value={props.account.getBalance(props.network.config.legacytoken).balance}
				/>
				available to swap
			</p>
		</div>

		<Button
			class="justify-self-center"
			href={urlPath(
				`/swap/${props.network.config.legacytoken.id.url}/${props.network.token.id.url}`
			)}
		>
			Swap
		</Button>
	</aside>
{/if}
