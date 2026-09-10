<script lang="ts">
	import {
		Action,
		Checksum256,
		Name,
		PermissionLevel,
		type Checksum256Type
	} from '@wharfkit/antelope';
	import Account from '$lib/components/elements/account.svelte';
	import { Code, Stack } from '@wharfkit/svelte-components';
	import Contract from '$lib/components/elements/contract.svelte';
	import { DateTime } from '@wharfkit/svelte-components';
	import type { ActionDisplayVariants } from '$lib/types';
	import Transaction from './transaction.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, type Component } from 'svelte';
	import type { ActionSummaryProps, ObjectifiedActionData } from '$lib/types/transaction';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import { Card } from '@wharfkit/svelte-components';

	import ActionSummaryContainer from '$lib/components/summary/components/container.svelte';
	import { getActionSummaryTitle } from '../summary';
	import { PUBLIC_SYSTEM_CONTRACT } from '$env/static/public';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		action: Action;
		datetime?: Date;
		objectified?: ObjectifiedActionData;
		id?: Checksum256Type;
		notified?: Name[];
		perspectiveOf?: Name;
		summary?: Component<ActionSummaryProps, object>;
		variant?: ActionDisplayVariants;
	}

	let {
		action,
		datetime,
		objectified,
		perspectiveOf,
		id,
		notified,
		summary: ActionSummary,
		variant = 'pretty'
	}: Props = $props();

	let summaryTitle = $derived(getActionSummaryTitle(action.account, action.name, objectified));
</script>

{#snippet KeyValue(key: string | null, value: string)}
	{@const isArray = Array.isArray(value)}
	{@const isObject = typeof value === 'object'}

	{#if key}
		{#if isArray || isObject}
			<dt class="text-muted inline after:content-[':']">
				{key}
			</dt>
			{#if isArray}
				<dd class="inline">
					<span class="sr-only">length</span>({value.length})
				</dd>
			{/if}
		{:else}
			<dt class="text-muted inline after:content-[':']">
				{key}
			</dt>
		{/if}
	{/if}

	{#if isArray}
		<dd>
			<ol class="ml-4 list-inside list-decimal">
				{#each value as v}
					<li class="marker:text-muted text-on-surface text-sm">
						{@render KeyValue(null, v)}
					</li>
				{/each}
			</ol>
		</dd>
	{:else if isObject && value}
		<ul class="ml-4">
			{#each Object.keys(value) as k}
				<li class="text-sm">
					{@render KeyValue(k, value[k])}
				</li>
			{/each}
		</ul>
	{:else}
		<dd class="text-on-surface inline">
			{value}
		</dd>
	{/if}
{/snippet}

{#snippet Decoded()}
	{#await context.network.decodeAction(action)}
		<Code json="Loading" />
	{:then result}
		<Code json={result} />
	{:catch error}
		{error.message}
		<Code json={action} />
	{/await}
{/snippet}

{#snippet Pretty(data: ObjectifiedActionData | undefined)}
	<Code
		collapsible
		class="bg-surface-container-high mt-1 [&_pre]:break-words [&_pre]:whitespace-pre-wrap [&.overflow-y-hidden]:max-h-80"
		indent={4}
	>
		{#if data}
			<dl>
				{#each Object.keys(data) as key}
					<div>
						{@render KeyValue(key, data[key])}
					</div>
				{/each}
			</dl>
		{:else}
			<span class="text-muted">No data</span>
		{/if}
	</Code>
{/snippet}

{#snippet Ricardian()}
	<Code>
		<div class="bg-surface-container overflow-auto rounded-sm p-4">
			Rendering of the ricardian contract is not yet supported.
		</div>
	</Code>
{/snippet}

{#snippet Summary()}
	{#if typeof objectified === 'object' && ActionSummary}
		<ActionSummaryContainer>
			<ActionSummary data={objectified} authorization={action.authorization} {perspectiveOf} />
		</ActionSummaryContainer>
	{:else}
		{@render Pretty(objectified)}
	{/if}
{/snippet}

{#snippet DateTimeTransactionLink()}
	{#if datetime}
		{#if id}
			<Transaction {id} class="text-muted text-sm leading-none tabular-nums">
				<DateTime {datetime} />
			</Transaction>
		{:else}
			<span class="text-muted text-sm leading-none tabular-nums">
				<DateTime {datetime} />
			</span>
		{/if}
	{/if}
{/snippet}

{#snippet Header()}
	<div
		class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 @lg:grid-cols-[auto_1fr_1fr] @lg:grid-rows-2"
	>
		<picture
			class="bg-surface-container-high row-span-3 grid size-12 place-items-center rounded-full @lg:row-span-full"
		>
			<SquareTerminal />
		</picture>

		{#if summaryTitle}
			<div
				class="text-on-surface col-start-2 row-start-1 self-end text-lg leading-none font-semibold @lg:col-start-2"
			>
				{summaryTitle}
			</div>

			<span class="col-start-2 row-start-2 grid content-start self-start">
				{@render DateTimeTransactionLink()}
			</span>
		{:else}
			<span class="flex gap-1 self-end text-nowrap">
				<Contract
					name={action.account}
					action={action.name}
					class="text-on-surface text-lg leading-none font-semibold"
				>
					{action.name}
				</Contract>
				<span class="text-muted text-lg leading-none">::</span>
				<Contract name={action.account} class="text-muted text-lg leading-none">
					{action.account}
				</Contract>
			</span>

			<div class="col-start-2 row-start-2 grid content-start">
				{@render DateTimeTransactionLink()}
			</div>
		{/if}

		<!-- Right -->
		{#if id}
			<Transaction
				{id}
				class="col-start-2 self-end text-lg leading-none text-nowrap @lg:col-start-3 @lg:justify-self-end"
			/>
		{/if}

		{#if summaryTitle}
			<span
				class="col-start-2 flex content-start gap-1 self-start text-sm text-nowrap @lg:col-start-3 @lg:justify-self-end"
			>
				<Contract name={action.account} class="text-muted leading-none">
					{action.account}
				</Contract>
				<span class="text-muted leading-none">::</span>
				<Contract name={action.account} action={action.name} class="text-muted leading-none">
					{action.name}
				</Contract>
			</span>
		{/if}
	</div>
{/snippet}

{#snippet Footer()}
	<div class="flex justify-between gap-6 px-1">
		<div>
			{#if action.authorization.length}
				<span class="text-muted text-xs">Signed by</span>
				<ul class="inline">
					{#each action.authorization as auth}
						<li class="inline">
							<Account name={Name.from(auth.actor)} class="text-on-surface mr-1  text-xs">
								{PermissionLevel.from(auth)}
							</Account>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- This section is reversed so the list reads better for a11y -->
		<div class="flex flex-row-reverse flex-wrap-reverse items-baseline gap-1 text-right">
			{#if notified}
				<span class="text-muted text-xs">notified</span>
				<ul class="inline">
					{#each notified as account}
						<li class="group inline text-xs nth-last-2:after:content-['and_']">
							<Account
								name={Name.from(account)}
								class="after:text-muted text-on-surface group-has-nth-3:bg-error gap-0 text-xs not-group-nth-last-2:not-group-last:after:content-[','] first:ml-0"
							/>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/snippet}

<Card class="@container">
	<Stack class="gap-4">
		{@render Header()}
		<svelte:boundary
			onerror={(error) =>
				console.warn(
					`Summary Component Rendering error for ${action.account}:${action.name}`,
					error
				)}
		>
			{#snippet failed()}
				{#if context.settings.data.developerMode}
					Error decoding for action summary, displaying raw data instead.
				{/if}
				{@render Pretty(objectified)}
			{/snippet}
			{#if variant === 'summary' || variant === 'table'}
				{@render Summary()}
			{:else if variant === 'ricardian'}
				{@render Ricardian()}
			{:else if variant === 'pretty'}
				{@render Pretty(objectified)}
			{:else if variant === 'decoded'}
				{@render Decoded()}
			{:else if variant === 'json'}
				<Code json={action} />
			{/if}

			{#if (action.account.equals(PUBLIC_SYSTEM_CONTRACT) || action.account.equals('eosio')) && action.name.equals('setcode') && objectified && objectified.code}
				{@render Pretty({ hash: String(Checksum256.hash(objectified.code)) })}
			{/if}

			{#if variant !== 'summary'}
				{@render Footer()}
			{/if}
		</svelte:boundary>
	</Stack>
</Card>
