<script lang="ts">
	import { Stack, Switcher } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { WithdrawManager } from './manager.svelte';
	import { Card } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: WithdrawManager = $state(new WithdrawManager(data.network));

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	function resetState() {
		manager = new WithdrawManager(data.network);
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={context.urlPath(`/staking`)} variant="secondary">Staking overview</Button>
		<Button href={context.urlPath(`/account/${context.account?.name}`)}>View my account</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Close</Button>
	{:else}
		<Switcher>
			<Stack class="gap-2">
				<h3 class="text-muted leading-none">Currently Withdrawable</h3>
				<p class="text-on-surface text-2xl font-bold">{String(manager.total)}</p>
			</Stack>
			<Button disabled={!manager.total.value} onclick={() => manager.transact()} variant="primary"
				>Withdraw</Button
			>
			{#if manager.voting && manager.sellingAll}
				<Card>
					<h4 class="text-title text-solar-500">Notice: Withdrawing will also clear votes</h4>
					<p>
						Withdrawing and removing all tokens from staking requires we unset any votes that were
						previously cast for either block producers or proxies.
					</p>
				</Card>
			{/if}
		</Switcher>
	{/if}
</Stack>
