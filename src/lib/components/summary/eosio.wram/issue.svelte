<script lang="ts">
	import * as WRAMContract from '$lib/wharf/contracts/token';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { Chip } from '@wharfkit/svelte-components';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { Asset, Name } from '@wharfkit/antelope';
	import Row from '../components/row.svelte';
	import { ArrowBigRight } from '@lucide/svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: WRAMContract.Types.issue;
	}

	const { data }: Props = $props();
</script>

<Row>
	<Chip>Issue</Chip>
	<AssetElement value={Asset.from(data.quantity)} variant="full" />
	<ArrowBigRight class="size-6" />
	<AccountElement name={Name.from(data.to)} />
</Row>
