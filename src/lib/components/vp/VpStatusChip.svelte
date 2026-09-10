<script lang="ts">
	import { Chip } from '@wharfkit/svelte-components';
	import type { VpStatus } from '$lib/vp/types';

	interface Props {
		status: VpStatus;
	}

	const { status }: Props = $props();

	const variants: Record<VpStatus, string> = {
		Draft: 'bg-surface-container-high text-muted',
		Review: 'bg-warning-container text-on-warning-container',
		Proposed: 'bg-primary-container text-on-primary-container',
		Executed: 'bg-success-container text-on-success-container',
		Rejected: 'bg-error-container text-on-error-container',
		Withdrawn: 'bg-surface-container-high text-muted',
		Superseded: 'bg-surface-container-high text-muted'
	};
</script>

<Chip class={variants[status]}>
	{#if status === 'Draft'}
		Draft
	{:else if status === 'Review'}
		Review
	{:else if status === 'Proposed'}
		Proposed
	{:else if status === 'Executed'}
		Executed
	{:else if status === 'Rejected'}
		Rejected
	{:else if status === 'Withdrawn'}
		Withdrawn
	{:else}
		Superseded
	{/if}
</Chip>
