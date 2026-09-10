<script lang="ts">
	import { getContext } from 'svelte';
	import About from '$lib/components/seo/about.svelte';
	import { watch } from 'runed';
	import { Asset, type Float64 } from '@wharfkit/antelope';
	import {
		Button,
		Card,
		Chip,
		Stack,
		NameInput,
		cn,
		Cluster,
		IconButton
	} from '@wharfkit/svelte-components';
	import Checkbox from './components/Checkbox.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Checksum256 } from '@wharfkit/antelope';
	import { ProducerVoteState } from './state.svelte';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import {
		Vote,
		Shield,
		Server,
		Scale,
		Blocks,
		Clock,
		Hash,
		ChartNoAxesCombined,
		Icon,
		CircleQuestionMark
	} from '@lucide/svelte';
	import VoteStat from './components/VoteStat.svelte';
	import { page } from '$app/state';

	const context = getContext<UnicoveContext>('state');
	const { producers } = context;

	const voteState = new ProducerVoteState(context.account, producers);

	watch(
		() => [context.account?.name.toString(), context.account?.loaded],
		() => {
			voteState.setAccount(context.account);
		}
	);

	function voteWeightToAsset(weight: Float64) {
		const symbol = context.network.chain.systemToken!.symbol;
		const voteDecay = context.network.config.voteDecay;
		const secondsPerDay = 86400;
		const blockTimestampEpoch = 946684800000;
		const secondsSinceEpoch = Date.now() / 1000 - blockTimestampEpoch / 1000;
		const weightExponent = Math.floor(secondsSinceEpoch / (secondsPerDay * 7)) / voteDecay;
		const stakedUnits = Number(weight) / Math.pow(2, weightExponent);
		const wholeTokens = Math.floor(stakedUnits / Math.pow(10, symbol.precision));
		return Asset.from(wholeTokens, `0,${symbol.name}`);
	}

	const votingWeight = $derived.by(() => {
		if (!context.account || !context.account.voter) {
			return null;
		}
		const staked = context.account.voter.staked;
		const symbol = context.network.config.systemtoken.symbol;
		return Asset.fromUnits(staked, symbol);
	});

	// Calculate vote age and decay
	const voteDecayInfo = $derived.by(() => {
		if (!context.account || !context.account.voter) {
			return null;
		}

		const staked = Number(context.account.voter.staked);
		const lastVoteWeight = Number(context.account.voter.weight);

		if (staked === 0 || lastVoteWeight === 0) {
			return null;
		}

		const precision = 10 ** context.network.chain.systemToken!.symbol.precision;
		const epoch = 946684800000; // Jan 1, 2000 in ms
		const msPerWeek = 86400 * 7 * 1000;
		const decayConstant = 52; // weeks for vote weight to double

		// Current vote weight multiplier
		const currentWeeks = Math.floor((Date.now() - epoch) / msPerWeek);
		const currentMultiplier = 2 ** (currentWeeks / decayConstant);

		// What the vote weight would be if voted now
		const freshVoteWeight = staked * currentMultiplier;

		// Calculate decay percentage
		const decayPercent = Math.max(0, (1 - lastVoteWeight / freshVoteWeight) * 100);

		// Reverse calculate when vote was cast
		const voteMultiplier = lastVoteWeight / staked;
		const voteWeeks = Math.log2(voteMultiplier) * decayConstant;
		const voteTimestamp = epoch + voteWeeks * msPerWeek;
		const voteDate = new Date(voteTimestamp);

		// Calculate age in days
		const ageMs = Date.now() - voteTimestamp;
		const ageDays = Math.floor(ageMs / (86400 * 1000));

		return {
			decayPercent: decayPercent.toFixed(1),
			voteDate,
			ageDays,
			effectiveWeight: Asset.from(
				lastVoteWeight / currentMultiplier / precision,
				context.network.chain.systemToken!.symbol
			)
		};
	});

	const currentVotes = $derived.by(() => {
		if (!context.account || !context.account.voter) {
			return [];
		}
		return context.account.voter.votes;
	});

	let transactionId = $state<Checksum256 | undefined>();
	let transactionError = $state<string | undefined>();
	let submitting = $state(false);

	async function handleVote() {
		if (!context.wharf || submitting) return;
		submitting = true;
		transactionError = undefined;
		try {
			const result = await voteState.submitVote(context.wharf, context.network.contracts.system);
			transactionId = result.resolved?.transaction.id;
			if (context.account) {
				await context.account.refresh();
			}
		} catch (e) {
			transactionError = e instanceof Error ? e.message : 'Failed to submit vote';
		} finally {
			submitting = false;
		}
	}

	function handleSuccess() {
		transactionId = undefined;
		// Sync initialVotes with current selection so UI doesn't reset
		voteState.confirmVote();
	}

	function handleFailure() {
		transactionError = undefined;
	}

	const tabOptions = $derived.by(() => {
		const base = context.urlPath('/producers');
		return [
			{ href: `${base}#account`, text: 'My Account', hash: 'account' },
			{ href: `${base}#why`, text: 'Why Vote?', hash: 'why' },
			{ href: `${base}#how`, text: 'How It Works', hash: 'how' }
		];
	});

	const activeTab = $derived.by(() => {
		const hash = page.url.hash.slice(1);
		if (hash && ['account', 'why', 'how'].includes(hash)) {
			return hash;
		}
		return 'account';
	});

	let searchQuery = $state('');

	const filteredProducers = $derived.by(() => {
		if (!searchQuery) {
			return producers.activeProducers;
		}
		const searchStr = String(searchQuery).toLowerCase().trim();
		if (searchStr === '') {
			return producers.activeProducers;
		}
		return producers.activeProducers.filter((producer) =>
			String(producer.owner).toLowerCase().includes(searchStr)
		);
	});
</script>

{#snippet Success()}
	<div class="flex justify-center">
		<Button onclick={handleSuccess}>Done</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex justify-center">
		<Button onclick={handleFailure}>Back</Button>
	</div>
{/snippet}

{#snippet CardHeader(icon: typeof Icon, title: string, description: string)}
	{@const IconComponent = icon}
	<div class="flex items-start gap-3">
		<picture
			class="bg-surface-container-high grid size-12 shrink-0 place-items-center rounded-full"
		>
			<IconComponent />
		</picture>
		<hgroup class="mt-1">
			<h2 class="text-title leading-6">{title}</h2>
			<p class="text-muted text-label-sm mt-1 leading-5 text-pretty">{description}</p>
		</hgroup>
	</div>
{/snippet}

{#snippet InnerCard(icon: typeof Icon, title: string, description: string)}
	{@const IconComponent = icon}
	<Card class="bg-surface-container flex gap-4">
		<div class="mt-1 shrink-0">
			<IconComponent class="size-6" />
		</div>
		<div class="space-y-1">
			<h3 class="text-body">{title}</h3>
			<p class="text-muted text-label-sm leading-5 text-pretty">
				{description}
			</p>
		</div>
	</Card>
{/snippet}

<Stack>
	<menu aria-label="page functions" class="flex gap-2 overflow-auto">
		{#each tabOptions as option}
			<li>
				<Button
					variant="pill"
					aria-current={activeTab === option.hash ? 'page' : undefined}
					href={option.href}
				>
					{option.text}
				</Button>
			</li>
		{/each}
	</menu>

	<Card>
		<Stack>
			{#if activeTab === 'account'}
				<Stack>
					{@render CardHeader(
						Vote,
						'My Voting Power',
						'Your voting power is determined by the amount of tokens you have staked.'
					)}

					{#if context.account && !context.account.loaded}
						<!-- Loading state while account data is being fetched -->
						<div class="grid gap-6 sm:grid-cols-3">
							<VoteStat label="Staked Balance">
								<div class="bg-surface-container h-8 w-24 animate-pulse rounded-lg"></div>
							</VoteStat>
							<VoteStat label="Vote Age">
								<div class="bg-surface-container h-8 w-24 animate-pulse rounded-lg"></div>
							</VoteStat>
							<VoteStat label="Vote Decay">
								<div class="bg-surface-container h-8 w-24 animate-pulse rounded-lg"></div>
							</VoteStat>
						</div>
					{:else if context.account && votingWeight}
						<div class="grid gap-6 sm:grid-cols-3">
							<VoteStat label="Staked Balance">
								<AssetText variant="full" value={votingWeight} />
							</VoteStat>

							{#if voteDecayInfo && currentVotes.length > 0}
								<VoteStat label="Vote Age">
									{voteDecayInfo.ageDays === 0
										? 'Today'
										: voteDecayInfo.ageDays === 1
											? '1 day'
											: `${voteDecayInfo.ageDays} days`}
								</VoteStat>

								<VoteStat
									label="Vote Decay"
									class={cn(Number(voteDecayInfo.decayPercent) > 10 && '[&_p]:text-success')}
								>
									{voteDecayInfo.decayPercent}%
								</VoteStat>
							{:else}
								<VoteStat label="Liquid Balance">
									<AssetText variant="full" value={context.account.balance.balance} />
								</VoteStat>

								<VoteStat label="Status">Not voting</VoteStat>
							{/if}
						</div>
					{:else}
						<!-- Logged out state -->
						<Stack
							class="border-outline-variant border-outline items-center gap-4 rounded-xl border p-8 text-center"
						>
							<Stack class="gap-2">
								<p class="text-on-surface text-headline">Connect to view your voting power</p>
								<p class="text-muted text-body">
									Login to see your staked balance, vote age, and help secure the network.
								</p>
							</Stack>
							<Button onclick={() => context.wharf?.login()}>Connect Wallet</Button>
						</Stack>
					{/if}
				</Stack>
			{:else if activeTab === 'why'}
				<Stack>
					<div class="flex items-start gap-4">
						{@render CardHeader(
							CircleQuestionMark,
							'Why Should You Vote?',
							'This network uses Delegated Proof of Stake (DPoS), a consensus mechanism where token holders elect block producers to validate transactions and secure the network. Your vote directly shapes who runs the infrastructure you depend on.'
						)}
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						{@render InnerCard(
							Shield,
							'Transaction Validation',
							'The block producers verify and process every transaction on the network'
						)}

						{@render InnerCard(
							Blocks,
							'Block Production',
							'Every 0.5 seconds, block producers bundle transactions into blocks'
						)}

						{@render InnerCard(
							Server,
							'Infrastructure Maintenance',
							'These block producers provide servers, bandwidth, and storage that keep the network running 24/7'
						)}

						{@render InnerCard(
							Scale,
							'Network Governance',
							'Block Producers vote on protocol upgrades and critical network decisions'
						)}
					</div>
				</Stack>
			{:else if activeTab === 'how'}
				<Stack>
					<div class="flex items-start gap-3">
						{@render CardHeader(
							Scale,
							'How Voting Works',
							"Voting for block producers is simple and flexible. Here's everything you need to know."
						)}
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						{@render InnerCard(
							ChartNoAxesCombined,
							'Vote with Staked Tokens',
							'Your vote weight equals the amount of tokens you have staked. More stake = more voting power.'
						)}

						{@render InnerCard(
							Hash,
							'Up to 30 Producers',
							'Select as many as 30 block producers. Your full voting power applies to each one.'
						)}

						{@render InnerCard(
							Clock,
							'Votes Decay Over Time',
							'Vote weight decays with a half-life of about one year. Re-vote periodically.'
						)}

						{@render InnerCard(
							Blocks,
							'Top 21 Produce Blocks',
							'Only the top 21 voted producers actively create blocks. Others serve as standbys.'
						)}
					</div>
				</Stack>
			{/if}
		</Stack>
	</Card>

	<div class="flex flex-col items-start gap-6 lg:flex-row-reverse">
		<!-- Vote for Producers Sidebar -->
		<Card class="sticky top-0 z-60 w-full shadow shadow-lg lg:top-4 lg:basis-sm lg:shadow-none">
			<TransactForm
				id={transactionId}
				error={transactionError}
				onsuccess={Success}
				onfailure={Failure}
			>
				<Stack class="gap-4 lg:gap-6">
					<hgroup class="flex items-baseline justify-between gap-1 lg:flex-col">
						<h2 class="text-title text-nowrap">Vote for Producers</h2>
						{#if context.account && !context.account.loaded}
							<div class="flex items-center gap-2">
								<svg
									class="text-muted size-4 animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								<p class="text-muted text-sm">Loading your votes...</p>
							</div>
						{:else}
							<p class="text-label-sm lg:hidden">
								{voteState.selected.size}/30
							</p>
							<p class="text-body hidden lg:block">
								Selected {voteState.selected.size} of 30 producers
							</p>
						{/if}
					</hgroup>

					{#if voteState.addedProducers.length > 0}
						<Stack class="gap-2">
							<p class="text-label-sm">Will vote for:</p>
							<Cluster class="flex-nowrap gap-2 overflow-auto lg:flex-wrap">
								{#each voteState.addedProducers as producer}
									<Chip class="bg-success text-on-success">
										{String(producer)}
									</Chip>
								{/each}
							</Cluster>
						</Stack>
					{/if}

					{#if voteState.removedProducers.length > 0}
						<Stack class="gap-2">
							<p class="text-label-sm">Will remove vote from:</p>
							<Cluster class="flex-nowrap gap-2 overflow-auto lg:flex-wrap">
								{#each voteState.removedProducers as producer}
									<Chip class="bg-error text-on-error">
										{String(producer)}
									</Chip>
								{/each}
							</Cluster>
						</Stack>
					{/if}

					<!-- button group -->
					<div class="flex flex-row-reverse gap-2 *:flex-1">
						<Button
							onclick={handleVote}
							disabled={!context.account ||
								!context.account.loaded ||
								!voteState.canVote ||
								submitting}
						>
							{#if submitting}
								Submitting...
							{:else if voteState.canRefresh}
								Refresh Vote
							{:else}
								Submit <span class="hidden @lg:inline">Vote</span>
							{/if}
						</Button>
						{#if voteState.hasChanges}
							<Button variant="secondary" onclick={() => voteState.reset()}>Cancel</Button>
						{/if}
					</div>
				</Stack>
			</TransactForm>
		</Card>

		<!-- Block Producers List -->
		<Card class="@container w-full lg:flex-1">
			<Stack class="gap-3">
				<hgroup class="flex flex-wrap items-center justify-between gap-4">
					<h2 class="text-title">Block Producers</h2>
					<div class="w-64">
						<NameInput bind:value={searchQuery} placeholder="Search producers..." />
					</div>
				</hgroup>

				{#if producers.loading}
					<div class="py-12 text-center">
						<p class="text-muted">Loading producers...</p>
					</div>
				{:else if producers.error}
					<Stack>
						<p class="text-on-error-container">{producers.error}</p>
						<Button onclick={() => producers.loadProducers()}>Try Again</Button>
					</Stack>
				{:else if filteredProducers.length === 0}
					<div class="py-12 text-center">
						<p class="text-muted">
							{searchQuery && String(searchQuery).trim()
								? 'No producers match your search'
								: 'No active producers found'}
						</p>
					</div>
				{:else}
					<div
						class="grid grid-cols-[auto_1fr_1fr_auto] gap-x-4 @lg:grid-cols-[auto_auto_1fr_1fr_3rem]"
					>
						<div class="col-span-full mt-3 hidden grid-cols-subgrid @lg:grid">
							<span class="col-start-1">Rank</span>
							<span class="col-start-2 text-center">Status</span>
							<span class="col-start-3">Actor</span>
							<span class="col-start-4 justify-self-end">Votes</span>
						</div>

						{#each filteredProducers as producer, index (String(producer.owner))}
							<button
								class="table-row-background table-row-border col-span-full grid cursor-pointer grid-cols-subgrid items-center py-3"
								onclick={(e) => {
									if (
										e.target instanceof HTMLAnchorElement ||
										(e.target instanceof HTMLElement && e.target.closest('a'))
									) {
										return;
									}
									if (
										context.account &&
										(voteState.isSelected(producer.owner) || voteState.selected.size < 30)
									) {
										voteState.toggleProducer(producer.owner);
									}
								}}
							>
								<span
									class:text-on-success={index < 21}
									class:@lg:text-on-surface={index < 21}
									class="@lg:text-body order-2 col-start-1 row-start-1 justify-self-center text-xs font-semibold @lg:justify-self-start @lg:font-normal"
									>{index + 1}</span
								>

								<div class="order-1 col-start-1 row-start-1 justify-self-center @lg:col-start-2">
									{#if index < 21}
										<Chip class="bg-success text-on-success text-label-sm hidden  @lg:block">
											Active
										</Chip>
										<Shield class="fill-success text-success @lg:hidden" />
									{:else}
										<Chip
											class="bg-surface-container-high text-muted text-label-sm hidden @lg:block"
										>
											Standby
										</Chip>
										<Shield
											class="text-surface-container-highest fill-surface-container-highest @lg:hidden"
										/>
									{/if}
								</div>

								<div class="flex items-center gap-1">
									<AccountLink name={producer.owner} />
									{#if producer.url}
										<IconButton
											icon={ExternalLink}
											href={producer.url}
											blank={true}
											class="text-muted hidden @lg:grid"
										/>
									{/if}
								</div>

								<div class="flex flex-col items-end gap-1">
									<AssetText
										value={voteWeightToAsset(producer.total_votes)}
										variant="short"
										class="text-label-sm md:text-body"
									/>
									<span class="text-muted text-label-sm">
										{producers.totalVotes > 0
											? ((Number(producer.total_votes) / producers.totalVotes) * 100).toFixed(2)
											: '0.00'}%
									</span>
								</div>

								<div class="grid justify-items-end">
									<Checkbox
										id={`producer-${String(producer.owner)}`}
										checked={voteState.isSelected(producer.owner)}
										disabled={!context.account ||
											(!voteState.isSelected(producer.owner) && voteState.selected.size >= 30)}
									/>
								</div>
							</button>
						{/each}
					</div>
					{#if producers.hasMore && !producers.showAll && (!searchQuery || !String(searchQuery).trim())}
						<div class="flex justify-center pt-4">
							<Button variant="secondary" onclick={() => producers.loadMore()}>Load More</Button>
						</div>
					{/if}
				{/if}
			</Stack>
		</Card>
	</div>
</Stack>

<About title="About block producers on {context.network.chain.name}">
	<p>
		Block producers are the validators of the {context.network.chain.name} network. Token holders elect
		them by voting with staked tokens, and the top-ranked producers take turns producing blocks and confirming
		the chain.
	</p>
	<p>
		Voting power is proportional to the amount staked. An account can vote for several producers at
		once or delegate its vote to a proxy. This page lists producers by rank with their vote totals
		and lets a signed-in account cast or update its votes. Rankings update as votes change, so the
		list reflects the current state of the election.
	</p>
</About>
