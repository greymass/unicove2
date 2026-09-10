<script lang="ts">
	import { Account, type AccountProps } from '@wharfkit/svelte-components';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	interface Props extends Omit<AccountProps, 'href'> {
		contract?: boolean;
	}

	let { contract = false, ...props }: Props = $props();

	let { network, urlPath } = getContext<UnicoveContext>('state');

	const href = $derived(
		contract ? urlPath(`/contract/${props.name}`) : urlPath(`/${network}/account/${props.name}`)
	);
</script>

<Account {...props} {href} />
