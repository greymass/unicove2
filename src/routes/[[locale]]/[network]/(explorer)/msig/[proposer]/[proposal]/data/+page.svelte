<script lang="ts">
	import { Code, CopyButton, Stack } from '@wharfkit/svelte-components';

	let props = $props();

	const json = $derived(JSON.stringify(props.data.proposal, null, 2));
</script>

<Stack>
	<div class="flex items-center justify-between gap-2">
		<h2 class="text-title">Proposal Data</h2>
		<CopyButton data={json} label="Copy proposal JSON" />
	</div>
	<Code class="[&_code]:break-all [&_pre]:whitespace-pre-wrap">
		{json}
	</Code>
</Stack>
