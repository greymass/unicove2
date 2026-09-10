<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack, Card, Button, DLRow, DL, DD, DT } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';
	import TopicCard from '$lib/components/sentiment/topicCard.svelte';
	import { Vote, Shield, FileText } from '@lucide/svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath, network, producers } = context;

	const top5Producers = $derived(producers.top21.slice(0, 5));
	const topTopics = $derived(data.sentimentState.topics.slice(0, 3));
</script>

<Stack>
	<Card>
		<div class="grid grid-rows-[auto_1fr] gap-6 lg:grid-flow-col lg:grid-cols-2">
			<Stack>
				<div class="flex items-center gap-3">
					<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
						<Shield />
					</picture>
					<hgroup>
						<h2 class="text-title">Block Producers</h2>
						{#if producers.statistics.totalActive}
							<p class="text-muted text-label-sm mt-1">
								{producers.statistics.totalActive} active
							</p>
						{/if}
					</hgroup>
				</div>

				<p class="max-w-md text-pretty">
					Vote for the validators that secure the {network.chain.name} network. Your voting power is
					weighted by your staked tokens, giving more influence to those with a larger stake in the network's
					security.
				</p>
			</Stack>

			<Button
				class="order-last lg:order-none lg:justify-self-start"
				variant="primary"
				href={urlPath('/producers')}
			>
				View All Producers
			</Button>

			<Stack class="mt-2 gap-2 lg:row-span-2">
				<h3 class="text-label">Top Producers</h3>
				<DL>
					{#each [0, 1, 2, 3, 4] as i}
						{@const producer = top5Producers[i]}
						{@const isLoading = producers.loading || !producer}
						{#if isLoading}
							<DLRow class="items-baseline">
								{#snippet title()}
									<DT>
										<span class="text-muted text-label-sm text-right">
											#{i + 1}
										</span>
									</DT>
								{/snippet}
								<DD>
									<span
										class="bg-surface-container inline-block w-full animate-pulse rounded-full px-2 py-0.5 text-xs"
										>&nbsp;</span
									>
								</DD>
							</DLRow>
						{:else}
							<DLRow>
								{#snippet title()}
									<DT>
										<span class="text-muted text-label-sm text-right">
											#{i + 1}
										</span>
									</DT>
								{/snippet}
								<DD>
									<a
										href={urlPath(`/account/${producer.owner}`)}
										class="flex items-center justify-between"
									>
										<AccountLink name={producer.owner} />
										<span class="bg-primary/10 text-primary text-label-sm rounded-full px-3 py-1">
											Top 21
										</span>
									</a>
								</DD>
							</DLRow>
						{/if}
					{/each}
				</DL>
			</Stack>
		</div>
	</Card>

	{#if network.supports('sentiment') && topTopics.length > 0}
		<Card>
			<div class="grid grid-rows-[auto_1fr] gap-6 lg:grid-flow-col lg:grid-cols-2">
				<Stack>
					<div class="flex items-center gap-3">
						<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
							<Vote />
						</picture>
						<hgroup>
							<h2 class="text-title">Sentiment Voting</h2>
							{#if data.sentimentState.topics.length}
								<p class="text-muted text-label-sm mt-1">
									{data.sentimentState.topics.length} active topics
								</p>
							{/if}
						</hgroup>
					</div>

					<p class="max-w-md text-pretty">
						Express your support or opposition on key network topics. Your vote is weighted by your
						staked tokens, helping the community gauge consensus on important issues.
					</p>
				</Stack>

				<Button
					class="order-last lg:order-none lg:justify-self-start"
					variant="primary"
					href={urlPath('/sentiment/topics')}>View All Topics</Button
				>

				<Stack class="mt-2 gap-2 lg:row-span-2">
					{#each topTopics as topic}
						<TopicCard
							topicData={topic}
							class="bg-surface-container hover:bg-surface-container-high"
						/>
					{/each}
				</Stack>
			</div>
		</Card>
	{/if}

	{#if network.supports('proposals')}
		<Card>
			<div class="grid grid-rows-[auto_1fr] gap-6 lg:grid-flow-col lg:grid-cols-2">
				<Stack>
					<div class="flex items-center gap-3">
						<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
							<FileText />
						</picture>
						<hgroup>
							<h2 class="text-title">Proposals</h2>
						</hgroup>
					</div>

					<p class="max-w-md text-pretty">
						Read network proposals published for public review, with their status and the accounts
						they affect.
					</p>
				</Stack>

				<Button
					class="order-last lg:order-none lg:justify-self-start"
					variant="primary"
					href={urlPath('/proposals')}>View All Proposals</Button
				>
			</div>
		</Card>
	{/if}
</Stack>
