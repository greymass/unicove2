<script lang="ts">
	import { getContext } from 'svelte';

	import { Code, CopyButton } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';

	import { ApprovalManager } from '../manager.svelte';
	import { POLL_CONTEXT, type SentimentPollBox } from '$lib/state/sentiment/poll.svelte';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const pollBox = getContext<SentimentPollBox>(POLL_CONTEXT);
	const manager = $state(new ApprovalManager(context, data.proposal, pollBox));
	$effect(() => {
		manager.sync(data.network, context.wharf);
	});
</script>

<Stack>
	<div class="flex items-center justify-between gap-2">
		<h2 class="text-title">Proposed Transaction</h2>
		<CopyButton
			data={JSON.stringify(manager.proposal.transaction, null, 2)}
			label="Copy transaction JSON"
		/>
	</div>
	<Code
		json={manager.proposal.transaction}
		class="[&_code]:break-all [&_pre]:whitespace-pre-wrap"
	/>
</Stack>
