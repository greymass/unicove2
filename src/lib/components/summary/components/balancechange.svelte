<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { EqualIcon } from '@lucide/svelte';
	import { Chip } from '@wharfkit/svelte-components';
	import type { Snippet } from 'svelte';
	import { ZeroUnits } from '$lib/types/token';
	import Row from './row.svelte';

	interface Props {
		account: NameType;
		balance: AssetType;
		delta: AssetType;
		children?: Snippet;
		perspectiveOf?: Name;
	}

	const { account, balance, delta, ...props }: Props = $props();
</script>

<Row>
	<div class="flex items-center gap-2">
		<Chip>Update</Chip>
		<span class="text-nowrap">
			{#if Asset.from(delta).units.gt(ZeroUnits)}+{/if}
			<AssetElement value={Asset.from(delta)} variant="full" />
		</span>
	</div>

	<AccountLink name={Name.from(account)} />

	<span class="flex items-center gap-1 text-nowrap">
		<EqualIcon class=" inline size-5" />
		<span>New Balance:</span>
		<AssetElement value={Asset.from(balance)} variant="full" />
	</span>

	{#if props.children}
		<span>
			{@render props.children()}
		</span>
	{/if}
</Row>
