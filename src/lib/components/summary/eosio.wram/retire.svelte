<script lang="ts">
	import * as WRAMContract from '$lib/wharf/contracts/token';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { Chip } from '@wharfkit/svelte-components';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: WRAMContract.Types.retire;
	}

	const { data }: Props = $props();
</script>

<Row>
	<Chip>Retire</Chip>
	<AssetElement value={Asset.from(data.quantity)} variant="full" />
</Row>
