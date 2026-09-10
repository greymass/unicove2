<!-- Unstaking balances table. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Card, Stack, Table, TD, TH, TR } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);

	interface Props extends HTMLAttributes<HTMLDivElement> {
		href?: string;
		records?: Array<UnstakingRecord>;
	}

	const { href, records = [], ...props }: Props = $props();
</script>

{#if records.filter((r) => !r.savings).length > 0}
	<Card {...props} title="Unstaking" class="auto-rows-max">
		<Stack>
			<p>
				The tokens currently being unstaked are listed below with the date they become available.
				These balances will continue to earn rewards until they are withdrawn.
			</p>
			<Table>
				{#snippet thead()}
					<TH class="text-left">Amount</TH>
					<TH class="text-right">Date Available</TH>
				{/snippet}

				{#each records as record}
					{#if !record.savings}
						<TR>
							<TD><AssetText variant="full" value={record.balance} /></TD>
							<TD class="text-right">
								{record.date ? record.date.toLocaleTimeString(locale) : '--'}
								{record.date ? record.date.toLocaleDateString(locale) : '--'}
							</TD>
						</TR>
					{/if}
				{/each}
			</Table>
			{#if href}
				<Button {href} variant="secondary">Withdraw</Button>
			{/if}
		</Stack>
	</Card>
{/if}
