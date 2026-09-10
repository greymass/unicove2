<script lang="ts">
	import CircleX from '@lucide/svelte/icons/circle-x';

	interface Props {
		error?: string;
		hidden?: boolean;
		onfailure?: () => ReturnType<import('svelte').Snippet>;
	}

	const { error, hidden, onfailure }: Props = $props();
</script>

<div class="space-y-6 rounded-lg text-center" class:hidden>
	<CircleX class="text-error inline size-24" />

	<div class=" space-y-3">
		<h2 class="text-title">Transaction Error</h2>

		<p class="mx-auto max-w-prose break-words">
			{error}
		</p>
	</div>

	{#if onfailure}
		{@render onfailure()}
	{/if}
</div>
