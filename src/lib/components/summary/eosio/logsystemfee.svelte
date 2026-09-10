<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { Types as RAMTypes } from '$lib/types/ram';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { Chip } from '@wharfkit/svelte-components';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: RAMTypes.logsystemfee;
	}

	const { data }: Props = $props();
</script>

<Row>
	<Chip>Fee</Chip>
	<AssetElement value={Asset.from(data.fee)} variant="full" />
</Row>
