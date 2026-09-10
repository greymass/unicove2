<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import { Card, Stack, Button, Number as NumberFormat } from '@wharfkit/svelte-components';
	import { ThumbsDown, ThumbsUp, Users } from '@lucide/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { VoteWithWeight, SentimentStatistics } from '$lib/types/sentiment';
	import AssetText from '$lib/components/elements/asset.svelte';
	import StatCard from '$lib/components/sentiment/StatCard.svelte';

	interface Props {
		votes: VoteWithWeight[];
		statistics: SentimentStatistics;
		pagination?: {
			total: number;
			page: number;
			hasMore: boolean;
		};
		onLoadMore?: () => void;
	}

	const { votes, statistics, pagination, onLoadMore }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const supporters = $derived(votes.filter((v) => v.voteType === 1));
	const opposers = $derived(votes.filter((v) => v.voteType === 0));
	const systemTokenSymbol = $derived(context.network.chain.systemToken?.symbol || '4,EOS');
</script>

<Stack class="gap-3">
	<h2 class="text-on-surface text-headline">Participants</h2>

	<Stack>
		<div class="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
			<StatCard label="Supporting" icon={ThumbsUp} supports={true}>
				<NumberFormat number={statistics.supportVotes} />
			</StatCard>

			<StatCard
				class="order-first col-span-full @4xl:order-none @4xl:col-span-1"
				label="Participants"
				icon={Users}
			>
				<NumberFormat number={statistics.totalVotes} />
			</StatCard>

			<StatCard label="Opposing" icon={ThumbsDown} supports={false}>
				<NumberFormat number={statistics.oppositionVotes} />
			</StatCard>
		</div>

		<div class="grid gap-6 @xl:grid-cols-2">
			<Stack class="gap-3">
				<h3 class="text-title">Supporting</h3>
				<Card>
					{#if supporters.length > 0}
						<ul class="space-y-3">
							{#each supporters as vote (vote.voter)}
								<li class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<span
											class="text-label-sm text-success bg-success/10 hidden rounded px-2 py-1 @2xl:block"
										>
											Support
										</span>
										<ThumbsUp class="text-success mb-1 size-4 @2xl:hidden" />
										<a
											href={context.urlPath(`/account/${vote.voter}`)}
											class="text-primary hover:text-primary-hover font-mono"
										>
											{vote.voter}
										</a>
									</div>

									<AssetText
										class="text-on-surface-variant text-label-sm "
										variant="short"
										value={Asset.fromUnits(vote.weight, systemTokenSymbol)}
									/>
								</li>
							{/each}
						</ul>
					{:else}
						<p>No supporting votes</p>
					{/if}
				</Card>
			</Stack>

			<Stack class="gap-3">
				<h3 class="text-title">Opposing</h3>
				<Card>
					{#if opposers.length > 0}
						<ul class="space-y-3">
							{#each opposers as vote (vote.voter)}
								<li class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<span
											class="bg-error/10 text-error text-label-sm hidden rounded px-2 py-1 @2xl:block"
										>
											Oppose
										</span>
										<ThumbsDown class="text-error mt-0.5 size-4 @2xl:hidden" />
										<a
											href={context.urlPath(`/account/${vote.voter}`)}
											class="text-primary hover:text-primary-hover font-mono"
										>
											{vote.voter}
										</a>
									</div>

									<AssetText
										class="text-on-surface-variant text-label-sm"
										variant="short"
										value={Asset.fromUnits(vote.weight, systemTokenSymbol)}
									/>
								</li>
							{/each}
						</ul>
					{:else}
						<p>No opposing votes</p>
					{/if}
				</Card>
			</Stack>
		</div>

		{#if pagination && pagination.hasMore && onLoadMore}
			<div class="mt-4 space-y-2 text-center">
				<p class="text-on-surface-variant text-label-sm">
					Showing {votes.length} of {pagination.total} participants
				</p>
				<Button variant="secondary" onclick={onLoadMore}>
					Load More ({pagination.total - votes.length} remaining)
				</Button>
			</div>
		{/if}
	</Stack>
</Stack>
