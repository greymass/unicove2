<script lang="ts">
	import { page } from '$app/state';
	import { SingleCard } from '$lib/components/layout';
	import Pageheader from '$lib/components/pageheader.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import Generic404 from '$lib/components/errors/generic.svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<Pageheader
	title={page.error?.title || ''}
	subtitle={page.error?.subtitle || ''}
	network={context.network}
/>

<SingleCard>
	<div class="grid place-items-center gap-6 self-center text-center">
		<div class="*:object-fit max-w-sm *:size-full">
			<Generic404 />
		</div>
		<p class="text-pretty break-all">
			{#if page.error?.message}
				{page.error.message}
			{:else}
				Page not found
			{/if}
		</p>
	</div>
</SingleCard>
