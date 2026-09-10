<script lang="ts">
	import Renting from '../renting.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { SingleCard } from '$lib/components/layout';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const network = data.network;
	const account = $derived(context.account);
</script>

<!-- TODO: SingleCard layout -->
<SingleCard>
	<Renting rentType="REX" {network} {account}></Renting>
</SingleCard>
