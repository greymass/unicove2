<script lang="ts">
	import { Name, type NameType } from '@wharfkit/antelope';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import Container from '../components/container.svelte';
	import Row from '../components/row.svelte';
	import EntryRow from './entry-row.svelte';
	import type { BeneficiaryEntry } from './types';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			funder: NameType;
			entries: BeneficiaryEntry[];
		};
	}

	const { data }: Props = $props();
</script>

<Container>
	<Row>
		<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
			<Chip>Standing order</Chip>
			<span class="text-on-surface-variant">set by</span>
			<AccountLink name={Name.from(data.funder)} />
		</span>
	</Row>
	{#each data.entries as entry}
		<Row>
			<EntryRow {entry} />
		</Row>
	{/each}
</Container>
