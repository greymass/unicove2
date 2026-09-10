<script lang="ts">
	import { Name } from '@wharfkit/antelope';
	import { Chip } from '@wharfkit/svelte-components';

	import AccountLink from '$lib/components/elements/account.svelte';
	import type { BeneficiaryEntry } from './types';

	interface Props {
		entry: BeneficiaryEntry;
	}

	const { entry }: Props = $props();

	const floor = $derived(
		[
			entry.cpu_floor_ms != null ? `${entry.cpu_floor_ms} ms` : null,
			entry.net_floor_kb != null ? `${entry.net_floor_kb} kB` : null
		]
			.filter(Boolean)
			.join(' / ')
	);

	const increment = $derived(
		[
			entry.cpu_increment_ms != null ? `+${entry.cpu_increment_ms} ms` : null,
			entry.net_increment_kb != null ? `+${entry.net_increment_kb} kB` : null
		]
			.filter(Boolean)
			.join(' / ')
	);
</script>

<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
	<AccountLink name={Name.from(entry.account)} />
	{#if floor}
		<span class="text-on-surface-variant text-sm">floor {floor}</span>
	{/if}
	{#if increment}
		<span class="text-on-surface-variant text-sm">{increment}</span>
	{/if}
	{#if entry.paused}
		<Chip class="bg-error-container text-on-error-container">Paused</Chip>
	{/if}
</span>
