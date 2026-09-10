<script lang="ts">
	import { Name, type NameType } from '@wharfkit/antelope';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			funder: NameType;
		};
	}

	const { data }: Props = $props();
</script>

<Row>
	<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
		<Chip>Standing order</Chip>
		<AccountLink name={Name.from(data.funder)} />
		<span class="text-on-surface-variant">removed their standing order</span>
	</span>
</Row>
