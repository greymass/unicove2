<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import {
		Card,
		Stack,
		Table,
		TD,
		TH,
		TR,
		Number as NumberFormat
	} from '@wharfkit/svelte-components';
	import { ThumbsDown, ThumbsUp, Users } from '@lucide/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { MetricLens, VoteWithWeight } from '$lib/types/sentiment';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import StatCard from './StatCard.svelte';

	interface Props {
		votes: VoteWithWeight[];
		lens: MetricLens;
		totalVotes: number;
		supportVotes: number;
		oppositionVotes: number;
		systemSymbol: Asset.Symbol;
	}

	const { votes, lens, totalVotes, supportVotes, oppositionVotes, systemSymbol }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const columns: { key: MetricLens; label: string }[] = $derived([
		{ key: 'system', label: String(systemSymbol.name) },
		{ key: 'ram', label: 'RAM' },
		{ key: 'v', label: 'V' }
	]);
</script>

{#snippet value(vote: VoteWithWeight, key: MetricLens)}
	{#if key === 'system'}
		<AssetText variant="short" value={Asset.fromUnits(vote.metrics.system.total, systemSymbol)} />
	{:else if key === 'ram'}
		{formatBytes(vote.metrics.ram.total)}
	{:else}
		{vote.metrics.v.total.toLocaleString()} V
	{/if}
{/snippet}

<Stack class="gap-3">
	<h2 id="participants" class="text-on-surface text-headline scroll-mt-24">Participants</h2>

	<div class="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
		<StatCard label="Supporting" icon={ThumbsUp} supports={true}>
			<NumberFormat number={supportVotes} />
		</StatCard>

		<StatCard
			class="order-first col-span-full @4xl:order-none @4xl:col-span-1"
			label="Participants"
			icon={Users}
		>
			<NumberFormat number={totalVotes} />
		</StatCard>

		<StatCard label="Opposing" icon={ThumbsDown} supports={false}>
			<NumberFormat number={oppositionVotes} />
		</StatCard>
	</div>

	<Card>
		<div class="overflow-x-auto">
			<Table full>
				{#snippet thead()}
					<TH>Voter</TH>
					<TH>Vote</TH>
					{#each columns as column (column.key)}
						<TH class="text-right {column.key === lens ? 'text-on-surface' : ''}">
							{column.label}
						</TH>
					{/each}
				{/snippet}
				{#each votes as vote (vote.voter)}
					<TR>
						<TD>
							<a
								href={context.urlPath(`/account/${vote.voter}`)}
								class="text-primary hover:text-primary-hover font-mono"
							>
								{vote.voter}
							</a>
						</TD>
						<TD>
							{#if vote.voteType === 1}
								<span class="text-success flex items-center gap-1">
									<ThumbsUp class="size-4" /> <span class="hidden @2xl:inline">Support</span>
								</span>
							{:else}
								<span class="text-error flex items-center gap-1">
									<ThumbsDown class="size-4" /> <span class="hidden @2xl:inline">Oppose</span>
								</span>
							{/if}
						</TD>
						{#each columns as column (column.key)}
							<TD
								class="text-right {column.key === lens
									? 'text-on-surface font-medium'
									: 'text-on-surface-variant'}"
							>
								{@render value(vote, column.key)}
							</TD>
						{/each}
					</TR>
				{/each}
			</Table>
		</div>
	</Card>
</Stack>
