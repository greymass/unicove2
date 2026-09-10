<script lang="ts">
	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import Row from '../components/row.svelte';
	import { Chip } from '@wharfkit/svelte-components';
	import { Int64, Name } from '@wharfkit/antelope';
	import { ZeroUnits } from '$lib/types/token';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.powerup;
	}

	const { data }: Props = $props();
</script>

{#if Int64.from(data.cpu_frac).gt(ZeroUnits)}
	<Row>
		<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
			<Chip>Resources</Chip>
			<span class="inline-flex items-center gap-1">
				<AccountElement name={Name.from(data.payer)} />
				<span class="text-on-surface-variant">renting CPU for</span>
				<AccountElement name={Name.from(data.receiver)} />
			</span>
			<span class="text-on-surface-variant text-sm">({data.cpu_frac})</span>
		</span>
	</Row>
{/if}

{#if Int64.from(data.net_frac).gt(ZeroUnits)}
	<Row>
		<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
			<Chip>Resources</Chip>
			<span class="inline-flex items-center gap-1">
				<AccountElement name={Name.from(data.payer)} />
				<span class="text-on-surface-variant">renting NET for</span>
				<AccountElement name={Name.from(data.receiver)} />
			</span>
			<span class="text-on-surface-variant text-sm">({data.net_frac})</span>
		</span>
	</Row>
{/if}
