<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageData;
</script>

<h1>{data.id}</h1>

<pre>
{JSON.stringify(data.transaction, null, 2)}
</pre>
