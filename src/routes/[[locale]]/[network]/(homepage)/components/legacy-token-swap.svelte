<script lang="ts">
	import type { NetworkState } from '$lib/state/network.svelte';
	import { Button } from '@wharfkit/svelte-components';

	import { Chains } from '@wharfkit/common';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { urlPath } = getContext<UnicoveContext>('state');

	interface Props {
		network: NetworkState;
	}
	let props: Props = $props();
</script>

{#if props.network.chain.equals(Chains.Vaulta) && props.network.config.legacytoken}
	<section class="@container col-span-full">
		<aside
			class="flex flex-wrap items-center gap-4 gap-y-6 rounded-lg bg-linear-to-r from-[#1C2399] to-[#2E3BFF] p-4 shadow-lg"
		>
			<div class="flex flex-1 items-center gap-4">
				<svg
					class="mx-6 shrink-0"
					width="81"
					height="33"
					viewBox="0 0 81 33"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M53.9058 8.10812H42.9195C42.4884 8.10812 42.0742 8.27376 41.7692 8.56834L16.4699 33H0V9.47065L9.79565 0.00043682V26.2295H11.1953L36.759 1.54238C37.7818 0.554629 39.1685 0 40.6146 0H53.9058V8.10855V8.10812ZM81 0H64.5297L39.2308 24.4312C38.9258 24.7258 38.5116 24.8912 38.0805 24.8912H27.0942V32.9996H40.3739C41.8274 32.9996 43.2214 32.4423 44.2487 31.4495L69.8042 6.77093H71.2039V28.9321H55.4209V33H71.2039L72.6579 31.5944L74.0137 30.2837L81 23.5298V0Z"
						fill="white"
					/>
				</svg>

				<div class="grid min-w-40 gap-1">
					<p class="text-lg leading-tight font-semibold text-balance text-white">
						{props.network.chain.name} Token Swap has begun!
					</p>
					<p class="text-sm leading-snug text-pretty text-white/80">
						Swap {props.network.config.legacytoken?.name} to {props.network.token.name} at a 1:1 ratio
					</p>
				</div>
			</div>

			<div class="grid w-full grid-cols-1 items-center gap-2 @sm:grid-cols-2 @3xl:w-auto">
				<Button
					class="text-white"
					variant="text"
					href="https://www.vaulta.com/resources/vaulta-token-swap-a-begins-may-14"
				>
					Learn more
				</Button>
				<Button
					class="bg-white/90 text-[#1c2399]"
					href={urlPath(
						`/swap/${props.network.config.legacytoken.id.url}/${props.network.token.id.url}`
					)}
				>
					Swap to {props.network.token.name}
				</Button>
			</div>
		</aside>
	</section>
{/if}
