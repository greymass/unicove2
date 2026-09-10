<script lang="ts">
	import { Block, type BlockProps } from '@wharfkit/svelte-components';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	let props: Omit<BlockProps, 'href'> = $props();

	let { urlPath } = getContext<UnicoveContext>('state');

	const href = $derived(urlPath(`/block/${String(props.number)}`));
</script>

<Block {...props} {href} />
