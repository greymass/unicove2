<script lang="ts">
	import { getContext } from 'svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import { Button, Switcher } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	let current = $derived(context.settings.data.actionDisplayVariant);

	function set(variant: ActionDisplayVariants) {
		context.settings.data.actionDisplayVariant = variant;
	}
</script>

<Switcher>
	<Button
		variant={current !== 'summary' ? 'secondary' : 'primary'}
		active={current === 'summary'}
		onclick={() => set('summary')}
	>
		Summary
	</Button>
	<Button
		variant={current !== 'table' ? 'secondary' : 'primary'}
		active={current === 'table'}
		onclick={() => set('table')}
	>
		Table
	</Button>
	{#if context.settings.data.debugMode}
		<Button
			variant={current !== 'ricardian' ? 'secondary' : 'primary'}
			active={current === 'ricardian'}
			onclick={() => set('ricardian')}
		>
			Ricardian
		</Button>
	{/if}
	<Button
		variant={current !== 'pretty' ? 'secondary' : 'primary'}
		active={current === 'pretty'}
		onclick={() => set('pretty')}
	>
		Action Data
	</Button>
	{#if context.settings.data.developerMode}
		<Button
			variant={current !== 'decoded' ? 'secondary' : 'primary'}
			active={current === 'decoded'}
			onclick={() => set('decoded')}
		>
			Decoded
		</Button>
		<Button
			variant={current !== 'json' ? 'secondary' : 'primary'}
			active={current === 'json'}
			onclick={() => set('json')}
		>
			JSON
		</Button>
	{/if}
</Switcher>
