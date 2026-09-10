<script lang="ts">
	import { Asset, Name } from '@wharfkit/session';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { Types } from '$lib/types/rex';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { Chip } from '@wharfkit/svelte-components';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.mvfrsavings;
	}

	const { data }: Props = $props();
</script>

<Row>
	<Chip>Staking</Chip>
	<AssetElement value={Asset.from(data.rex)} variant="full" />
	<AccountElement name={Name.from(data.owner)} />
</Row>
