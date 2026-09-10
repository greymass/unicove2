<script lang="ts">
	import { Name, type NameType } from '@wharfkit/antelope';
	import { Chip } from '@wharfkit/svelte-components';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountLink from '$lib/components/elements/account.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: {
			beneficiary: NameType;
			cpu_ms: number;
			net_kb: number;
		};
	}

	const { data }: Props = $props();
</script>

<Row>
	<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
		<Chip>Top-up</Chip>
		<span class="text-on-surface-variant">requested for</span>
		<AccountLink name={Name.from(data.beneficiary)} />
		<span class="text-on-surface-variant text-sm">{data.cpu_ms} ms CPU / {data.net_kb} kB NET</span>
	</span>
</Row>
