<script lang="ts">
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
</script>

<p>Resources</p>

<pre>
{JSON.stringify(data.transaction, null, 2)}
</pre>
