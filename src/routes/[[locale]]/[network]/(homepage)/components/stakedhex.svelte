<script lang="ts">
	import { type UnicoveContext } from '$lib/state/client.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	let tokenLogo = $derived(String(network.token.media?.logo?.dark));
	let tokenName = $derived(String(network.token.name));

	interface PageProps {
		staked: Asset;
		apr: string;
	}

	const { staked, apr }: PageProps = $props();
</script>

<div class="relative max-w-fit">
	<!-- Big hex -->
	<div class="grid place-items-center *:col-start-1 *:row-start-1">
		<svg
			class="text-surface-container size-64 object-contain md:size-full"
			width="296"
			height="342"
			viewBox="0 0 296 342"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m148.245.755 147.437 85.123v170.245l-147.437 85.123L.809 256.123V85.878L148.245.755Z"
				fill="currentColor"
			/>
		</svg>
		<div class="grid text-center uppercase">
			<img class="mb-4 h-12 place-self-center md:h-20" src={tokenLogo} alt={tokenName} />
			<span class="md:text-md text-muted text-sm">Total Staked</span>
			<!-- TODO: add eos formatter -->
			<span class="text-md font-semibold md:text-xl">
				<AssetText value={staked} variant="short" />
			</span>
		</div>
	</div>

	<!-- Small hex -->
	<div class="absolute -right-2 -bottom-4 grid place-items-center *:col-start-1 *:row-start-1">
		<svg
			class="text-surface-container-highest size-24 object-contain md:size-full"
			width="95"
			height="110"
			viewBox="0 0 95 110"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m47.522.804 47.18 27.24v54.478l-47.18 27.239-47.18-27.24V28.044L47.522.804Z"
				fill="currentColor"
			/>
		</svg>
		<div class="grid text-center uppercase">
			<span class="md:text-md text-muted text-sm">APR</span>
			<span class="text-md font-semibold md:text-xl">{apr}%</span>
		</div>
	</div>
</div>
