<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import { formatDateTime } from '$lib/utils/intl';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpStatusChip from '$lib/components/vp/VpStatusChip.svelte';
	import { vpCardText } from '$lib/vp/card';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	const locale = $derived(page.params.locale ?? 'en');
	const formatDate = (value: string) =>
		formatDateTime(new Date(value), locale, { dateStyle: 'medium', timeStyle: undefined });
</script>

<Stack>
	{#if data.error}
		<Card>
			<Stack class="items-start gap-2">
				<h2 class="text-title">Proposal list unavailable</h2>
				<p class="text-muted">{data.error}</p>
				<a class="text-primary hover:underline" href={page.url.pathname} data-sveltekit-reload>
					Try again
				</a>
			</Stack>
		</Card>
	{:else if data.proposals.length === 0}
		<Card>
			<Stack class="gap-2">
				<h2 class="text-title">No published proposals</h2>
				<p class="text-muted">
					Proposals appear here once they are published for public review in the proposals
					repository.
				</p>
			</Stack>
		</Card>
	{:else}
		{#each data.proposals as proposal (proposal.vp)}
			{@const card = vpCardText(proposal, locale)}
			<a class="group block" href={urlPath(`/proposals/${proposal.vp.toLowerCase()}`)}>
				<Card class="group-hover:bg-surface-container transition-colors">
					<Stack class="gap-2">
						<div class="flex flex-wrap items-center gap-3">
							<span class="text-label-sm text-muted">{proposal.vp}</span>
							<VpStatusChip status={proposal.status} />
							<span class="text-muted ml-auto text-sm">
								{#if proposal.updated}
									Updated {formatDate(proposal.updated)}
								{:else}
									Created {formatDate(proposal.created)}
								{/if}
							</span>
						</div>
						<span class="text-title group-hover:underline">{card.title}</span>
						{#if card.excerpt}
							<p class="text-muted line-clamp-2 max-w-[60ch] text-sm">{card.excerpt}</p>
						{/if}
					</Stack>
				</Card>
			</a>
		{/each}
	{/if}
</Stack>
