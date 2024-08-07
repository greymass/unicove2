<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import AccountLink from '$lib/components/link/account.svelte';
	import { supportedChains } from '$lib/wharf/client';
	import { languageTag } from '$lib/paraglide/runtime';

	export let data: PageData;
</script>

<h1>{data.name}</h1>

<ul>
	<li>
		<a href={`/${languageTag()}/account/${data.name}`}> default (eos) </a>
	</li>
	{#each Object.keys(supportedChains) as chain}
		<li>
			<a href={`/${languageTag()}/${chain}/account/${data.name}`}>
				{chain}
			</a>
		</li>
	{/each}
</ul>

<AccountLink contract name={data.name}>View Contract</AccountLink>

{#if data.account}
	<pre>
{JSON.stringify(data.account, null, 2)}
</pre>
{:else}
	<p>Account not found!</p>
{/if}
