<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageData;
</script>

<h1>{m.block_height_numbered({ height: data.height })}</h1>

<a href="/block/{Number(data.height) - 1}"
	>← {m.block_height_numbered({ height: Number(data.height) - 1 })}</a
>
<a href="/block/{Number(data.height) + 1}"
	>{m.block_height_numbered({ height: Number(data.height) + 1 })} →</a
>

<pre>
{JSON.stringify(data.block, null, 2)}
</pre>
