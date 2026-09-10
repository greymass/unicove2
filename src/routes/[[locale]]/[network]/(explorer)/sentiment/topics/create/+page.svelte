<script lang="ts">
	import { getContext } from 'svelte';
	import {
		Stack,
		NameInput,
		NameValidationError,
		Button,
		Label
	} from '@wharfkit/svelte-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { CreateTopicManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: CreateTopicManager = $state(new CreateTopicManager());
	let ready = $derived(manager.canSubmit && !!context.wharf.session && !context.wharf.transacting);
	let nameError: import('@wharfkit/svelte-components').NameValidationError | undefined = $state();
	let nameTouched = $state(false);
	const nameErrorMessage = $derived.by(() => {
		if (!nameTouched || !nameError) return '';
		switch (nameError) {
			case NameValidationError.INVALID_CHARACTERS:
				return 'Only lowercase letters a-z and digits 1-5 are allowed.';
			case NameValidationError.INVALID_LENGTH_MIN:
				return 'Topic ID is required.';
			case NameValidationError.INVALID_LENGTH_MAX:
				return 'Topic ID must be 12 characters or fewer.';
			default:
				return '';
		}
	});

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	function resetState() {
		manager = new CreateTopicManager();
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button
			href={context.urlPath(`/sentiment/topics/${String(manager.topicId)}`)}
			variant="secondary"
		>
			View Topic
		</Button>
		<Button href={context.urlPath('/sentiment/topics')} variant="secondary">Back to Topics</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Try Again</Button>
	{:else}
		<Stack class="gap-4">
			<div class="border-outline-variant/30 bg-surface-container-high rounded-xl border p-4">
				<p class="text-on-surface text-sm font-medium">Topic Creation Fee</p>
				<p class="text-muted mt-1 text-xs leading-relaxed">
					Creating a topic costs
					<strong class="text-on-surface-variant">{String(data.config.fees.createtopic)}</strong>
				</p>
			</div>

			<div class="border-outline-variant/30 bg-surface-container-high rounded-xl border p-4">
				<p class="text-on-surface text-sm font-medium">Before You Create</p>
				<ul class="text-muted mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed">
					<li>
						The creation fee is non-refundable. Fees are sent to the
						<strong class="text-on-surface-variant">{String(data.config.fees.receiver)}</strong>
						account, which distributes them through standard network fee channels (RAM, powerup, name
						bids).
					</li>
					<li>
						Topics cannot be edited or deleted by the creator once submitted, including the topic
						ID. Proofread carefully before submitting. To retain the ability to update details
						later, include a link to an external resource in the description.
					</li>
					<li>
						Your topic is permanently stored on the blockchain and can be accessed through any
						compatible interface. Unicove may choose not to display topics that violate its content
						policies, but the on-chain record is unaffected.
					</li>
				</ul>
			</div>

			<div class="bg-surface-container-high space-y-4 rounded-xl p-4">
				<fieldset class="grid gap-2">
					<Label for="topic-id">Topic ID</Label>
					<NameInput
						bind:value={manager.topicId}
						bind:valid={manager.topicIdValid}
						bind:error={nameError}
						id="topic-id"
						placeholder="Topic ID"
						onblur={() => (nameTouched = true)}
					/>
					{#if nameErrorMessage}
						<p class="text-error text-sm">{nameErrorMessage}</p>
					{/if}
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="topic-description">Description</Label>
					<textarea
						bind:value={manager.description}
						id="topic-description"
						placeholder="Describe what this topic is about..."
						rows="4"
						class="border-outline bg-surface rounded-lg border p-3 text-sm"
					></textarea>
				</fieldset>
			</div>

			{#if !context.wharf.session}
				<p class="text-on-surface-variant text-center text-sm">Please log in to create a topic</p>
			{/if}

			<Button disabled={!ready} onclick={() => manager.transact(data.config)} variant="primary">
				Create Topic
			</Button>
		</Stack>
	{/if}
</Stack>
