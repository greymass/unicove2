<script lang="ts">
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { Name } from '@wharfkit/antelope';
	import { Button, Label, NameInput } from '@wharfkit/svelte-components';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	let prompt = $derived(context.wharf.proposalNamePrompt);
	let inputValue: Name = $state(Name.from(''));
	let valid = $state(false);

	const {
		elements: { overlay, content, portalled },
		states: { open }
	} = createDialog({
		preventScroll: true,
		closeOnOutsideClick: false,
		escapeBehavior: 'ignore'
	});

	$effect(() => {
		if (prompt) {
			inputValue = Name.from(prompt.defaultName);
			$open = true;
		} else {
			$open = false;
		}
	});

	function submit() {
		if (!valid) return;
		context.wharf.submitProposalName(String(inputValue));
	}

	function cancel() {
		context.wharf.cancelProposalName();
	}
</script>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="bg-scrim/80 fixed inset-0 z-50"
			transition:fade={{ duration: 150 }}
		></div>

		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				use:melt={$content}
				class="bg-surface-container w-full max-w-md rounded-xl p-6 shadow-xl"
				transition:fade={{ duration: 150 }}
			>
				<form
					onsubmit={(e) => {
						e.preventDefault();
						submit();
					}}
				>
					<h2 class="text-on-surface mb-4 text-lg font-semibold">Proposal Name</h2>
					<p class="text-on-surface-variant mb-4 text-sm">
						Enter a name for this proposal or use the generated default.
					</p>

					<fieldset class="mb-4 grid gap-2">
						<Label for="proposal-name-input">Name</Label>
						<NameInput
							id="proposal-name-input"
							bind:value={inputValue}
							bind:valid
							placeholder="Proposal name"
						/>
					</fieldset>

					<div class="flex justify-end gap-3">
						<Button variant="secondary" onclick={cancel}>Cancel</Button>
						<Button variant="primary" disabled={!valid} type="submit">Confirm</Button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
