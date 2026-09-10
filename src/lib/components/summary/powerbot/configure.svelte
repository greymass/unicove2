<script lang="ts">
	import { Name, type NameType } from '@wharfkit/antelope';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import Row from '../components/row.svelte';
	import EntryRow from './entry-row.svelte';
	import type { BeneficiaryEntry } from './types';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			funder: NameType;
			beneficiary: NameType;
			cpu_floor_ms?: number | null;
			net_floor_kb?: number | null;
			cpu_increment_ms?: number | null;
			net_increment_kb?: number | null;
			paused: boolean;
		};
	}

	const { data }: Props = $props();

	const entry: BeneficiaryEntry = $derived({
		account: data.beneficiary,
		cpu_floor_ms: data.cpu_floor_ms,
		net_floor_kb: data.net_floor_kb,
		cpu_increment_ms: data.cpu_increment_ms,
		net_increment_kb: data.net_increment_kb,
		paused: data.paused
	});
</script>

<Row>
	<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
		<Chip>Order entry</Chip>
		<EntryRow {entry} />
		<span class="text-on-surface-variant">updated by</span>
		<AccountLink name={Name.from(data.funder)} />
	</span>
</Row>
