<script lang="ts">
	import { Asset as AssetElement, type AssetProps } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	let props: AssetProps = $props();

	const context = getContext<UnicoveContext>('state');
	const increasedPrecision = $derived(context.settings.data.increasedPrecision);
	const locale = $derived(context.settings.data.locale);
</script>

<AssetElement {...props} {increasedPrecision} {locale} />
