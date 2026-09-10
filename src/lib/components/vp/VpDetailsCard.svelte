<script lang="ts">
	import { Card, DD, DL, DLRow } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import { formatDateTime } from '$lib/utils/intl';
	import { parseVpDate } from '$lib/vp/dates';
	import { VP_BRANCH, vpStandardUrl } from '$lib/vp/links';
	import VpStatusChip from './VpStatusChip.svelte';
	import type { VpSummary } from '$lib/vp/types';
	import type { VpRevision } from '$lib/vp/revisions';

	interface Props {
		summary: VpSummary;
		revisions: VpRevision[];
		branch?: string;
	}

	const { summary, revisions, branch = VP_BRANCH }: Props = $props();
	const locale = $derived(page.params.locale ?? 'en');
	const formatDate = (value: string) =>
		formatDateTime(parseVpDate(value), locale, { dateStyle: 'medium', timeStyle: undefined });
	const highestVersion = $derived(
		revisions.length ? Math.max(...revisions.map((r) => r.version)) : null
	);
</script>

<Card>
	<h2 class="text-label-sm text-muted mb-3">Details</h2>
	<DL>
		<DLRow title="Status">
			<DD>
				<span class="flex justify-end"><VpStatusChip status={summary.status} /></span>
			</DD>
		</DLRow>
		<DLRow title="Created" description={formatDate(summary.created)} />
		{#if summary.updated}
			<DLRow title="Updated" description={formatDate(summary.updated)} />
		{/if}
		{#if highestVersion !== null}
			<DLRow title="Version" description={`v${highestVersion}`} />
		{/if}
		<DLRow title="Authors" description={summary.authors.join(', ')} />
		<DLRow title="Standard">
			<DD>
				<a
					class="text-primary hover:underline"
					href={vpStandardUrl(summary.standard, branch)}
					rel="noopener noreferrer"
					target="_blank"
				>
					{summary.standard}
				</a>
			</DD>
		</DLRow>
	</DL>
</Card>
