<!-- .../proposals/[vp]/multisigs/+page.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { vpMsigSteps } from '$lib/vp/onchain';
	import VpMsigStep from '$lib/components/vp/VpMsigStep.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	const basePath = $derived(context.urlPath(`/proposals/${page.params.vp}`));
	const locale = $derived(context.settings.data.locale);
	const steps = $derived(vpMsigSteps(data.summary, locale));
</script>

<Stack class="gap-4">
	{#if steps.length}
		<div>
			{#each steps as step, i (step.index)}
				<VpMsigStep {step} {basePath} last={i === steps.length - 1} />
			{/each}
		</div>
	{:else}
		<p class="text-muted text-sm">This proposal has no multisig bindings.</p>
	{/if}
</Stack>
