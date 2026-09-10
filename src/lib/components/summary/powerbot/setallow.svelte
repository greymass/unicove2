<script lang="ts">
	import { Name, type NameType } from '@wharfkit/antelope';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import Container from '../components/container.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			funder: NameType;
			beneficiaries: NameType[];
			patterns: { contract: NameType; action: NameType }[];
		};
	}

	const { data }: Props = $props();
</script>

<Container>
	<Row>
		<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
			<Chip>Allowance</Chip>
			<AccountLink name={Name.from(data.funder)} />
			<span class="text-on-surface-variant">allows watcher top-ups for</span>
			{#each data.beneficiaries as beneficiary}
				<AccountLink name={Name.from(beneficiary)} />
			{/each}
		</span>
	</Row>
	{#if data.patterns.length}
		<Row>
			<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
				<span class="text-on-surface-variant">patterns</span>
				{#each data.patterns as pattern}
					<Chip>{pattern.contract}::{pattern.action}</Chip>
				{/each}
			</span>
		</Row>
	{/if}
</Container>
