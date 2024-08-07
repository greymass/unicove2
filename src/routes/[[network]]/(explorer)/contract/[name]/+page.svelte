<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import AccountLink from '$lib/components/link/account.svelte';

	export let data: PageData;
</script>

<h1>Contract: {data.name}</h1>

<AccountLink name={data.name}>View Account</AccountLink>

<pre>
{JSON.stringify(data.abi, null, 2)}
</pre>
