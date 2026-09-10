<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { TopicStatistics } from '$lib/types/sentiment';
	import { percentString } from '$lib/utils';

	interface Props {
		id: string;
		statistics: Pick<TopicStatistics, 'supportPercentage' | 'oppositionPercentage'>;
		compact?: boolean;
	}

	const { statistics, compact = false, ...props }: Props = $props();
	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const meterLabel = $derived(
		`${percentString(locale, statistics.supportPercentage / 100, 0)} support, ${percentString(locale, statistics.oppositionPercentage / 100, 0)} oppose`
	);
</script>

<div class="grid gap-2">
	<div class="relative flex w-full items-center" class:h-7={!compact} class:h-4={compact}>
		{#if statistics.supportPercentage > 0 && statistics.oppositionPercentage > 0}
			<span
				class="bg-on-surface absolute top-0 h-full w-1 -translate-x-1 rounded-lg shadow"
				style="left: {statistics.supportPercentage}%"
			></span>
		{/if}

		<div class="flex-1 overflow-hidden rounded-lg" class:h-5={!compact} class:h-3={compact}>
			<progress
				class:bg-error={statistics.oppositionPercentage > 0}
				class:bg-surface-container-high={statistics.oppositionPercentage === 0}
				class="-webkit-progress-value:bg-success -webkit-progress-bar:bg-error bg-error h-full w-full"
				id={props.id}
				aria-label={meterLabel}
				max="100"
				value={statistics.supportPercentage}
			>
			</progress>
		</div>
	</div>

	{#if !compact}
		<label for={props.id} class="text-label-sm flex justify-between">
			<span
				class:text-success={statistics.supportPercentage > 0}
				class:text-muted={statistics.supportPercentage === 0}
			>
				{percentString(locale, statistics.supportPercentage / 100, 0)} Support
			</span>
			<span
				class="text-right"
				class:text-error={statistics.oppositionPercentage > 0}
				class:text-muted={statistics.oppositionPercentage === 0}
			>
				{percentString(locale, statistics.oppositionPercentage / 100, 0)} Oppose
			</span>
		</label>
	{/if}
</div>

<style>
	progress {
		-webkit-appearance: none;
		appearance: none;
		border: none;
	}

	/* Firefox foreground */
	progress::-moz-progress-bar {
		background: var(--color-success);
	}

	/* Chrome background */
	progress::-webkit-progress-bar {
		/* The value doesn't seem to matter, as long as it's set */
		background-color: transparent;
	}

	/* Chrome foreground */
	progress::-webkit-progress-value {
		background-color: var(--color-success);
	}
</style>
