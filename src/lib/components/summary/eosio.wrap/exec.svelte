<script lang="ts">
	import { getContext } from 'svelte';
	import { Action, Transaction } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { ActionSummaryProps, ObjectifiedActionData } from '$lib/types/transaction';
	import type { ActionDisplayVariants } from '$lib/types';
	import ActionCard from '$lib/components/elements/action.svelte';
	import AccountElement from '$lib/components/elements/account.svelte';
	import { getActionSummaryComponent } from '$lib/components/summary';
	import { Stack } from '@wharfkit/svelte-components';

	type Props = ActionSummaryProps;

	const { data }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);

	interface DecodedInnerAction {
		action: Action;
		objectified?: ObjectifiedActionData;
		summary?: ReturnType<typeof getActionSummaryComponent>;
	}

	let innerActions: DecodedInnerAction[] = $state([]);
	let loading = $state(true);

	$effect(() => {
		decodeInnerActions();
	});

	async function decodeInnerActions() {
		loading = true;
		try {
			const transaction = Transaction.from(data.trx);
			const decoded: DecodedInnerAction[] = [];

			for (const action of transaction.actions) {
				const typedAction = Action.from(action);
				try {
					const objectified = await context.network.objectifyAction(typedAction);
					const summaryComponent = getActionSummaryComponent(
						typedAction.account,
						typedAction.name,
						objectified
					);
					decoded.push({
						action: typedAction,
						objectified,
						summary: summaryComponent
					});
				} catch {
					decoded.push({ action: typedAction });
				}
			}

			innerActions = decoded;
		} catch (e) {
			console.error('Failed to decode wrapped transaction:', e);
			innerActions = [];
		}
		loading = false;
	}
</script>

<div class="border-primary border-l-3 pl-4">
	<div class="text-muted mb-3 flex items-center gap-2 text-sm">
		<span class="bg-primary text-on-primary rounded px-2 py-0.5 text-xs font-semibold">WRAP</span>
		<span>Executor:</span>
		<AccountElement name={data.executer} class="text-on-surface font-semibold" />
		<span class="opacity-40">·</span>
		<span>{innerActions.length} inner action{innerActions.length !== 1 ? 's' : ''}</span>
	</div>

	{#if loading}
		<p class="text-muted text-sm">Decoding wrapped actions...</p>
	{:else if innerActions.length === 0}
		<p class="text-muted text-sm">No actions in wrapped transaction</p>
	{:else}
		<Stack>
			{#each innerActions as decoded}
				<ActionCard
					action={decoded.action}
					objectified={decoded.objectified}
					summary={decoded.summary}
					{variant}
				/>
			{/each}
		</Stack>
	{/if}
</div>
