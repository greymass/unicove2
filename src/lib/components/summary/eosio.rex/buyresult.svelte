<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { Types } from '$lib/types/rex';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { Chip } from '@wharfkit/svelte-components';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.buyresult;
	}

	const { data }: Props = $props();
</script>

<Row>
	<Chip>Staking</Chip>
	<AssetElement value={Asset.from(data.rex_received)} variant="full" />
</Row>
