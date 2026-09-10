<script lang="ts">
	import { ABI, Action, Bytes, Checksum256, Name, Serializer } from '@wharfkit/antelope';
	import { Card, Fieldset, FileUpload } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { NameInput } from '@wharfkit/svelte-components';
	import TransactForm from '$lib/components/transact/form.svelte';
	import { Button } from '@wharfkit/svelte-components';

	import { SingleCard } from '$lib/components/layout/index.js';
	import { Stack } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	let accountInput: NameInput | undefined = $state();
	let accountRef: HTMLInputElement | undefined = $state();
	let accountValid = $state(false);
	let accountName: Name = $state(Name.from(''));

	onMount(() => {
		if (data.name) {
			accountName = Name.from(data.name);
			if (accountInput) {
				accountInput?.set(data.name);
			}
		}
	});

	const actions: Action[] = $state([]);
	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	function set(file: File) {
		const reader = new FileReader();
		const extension = file.name.split('.').pop();
		switch (extension) {
			case 'abi':
				reader.onload = setabi;
				break;
			case 'wasm':
				reader.onload = setcode;
				break;
			default:
				console.error('Unsupported file type');
				return;
		}
		reader.readAsArrayBuffer(file);
	}

	function setabi(this: FileReader) {
		const abi = ABI.from(JSON.parse(new TextDecoder().decode(this.result as ArrayBuffer)));
		actions.push(
			data.network.contracts.system.action('setabi', {
				account: accountName,
				abi: Serializer.encode({ object: abi })
			})
		);
	}

	function setcode(this: FileReader) {
		actions.push(
			data.network.contracts.system.action('setcode', {
				account: accountName,
				code: Bytes.from(this.result as ArrayBuffer),
				vmtype: 0,
				vmversion: 0
			})
		);
	}

	function remove(index: number) {
		actions.splice(index, 1);
	}

	async function transact() {
		context.wharf
			.transact({ actions })
			.then((result) => {
				id = result?.resolved?.transaction.id;
			})
			.catch((err) => {
				error = err.message;
			});
	}
</script>

{#snippet Success()}
	<div class="flex gap-4">
		<Button variant="secondary" onclick={() => (id = undefined)}>Back</Button>
		<Button href={context.urlPath(`/account/${context.account?.name}`)}>View my account</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex gap-4">
		<Button onclick={() => (error = undefined)}>Back</Button>
	</div>
{/snippet}

<SingleCard>
	<Stack>
		<TransactForm {id} {error} onsuccess={Success} onfailure={Failure}>
			<p>
				Enter an account name and select an ABI and/or WASM file to upload using the authority of
				the currently logged in account.
			</p>

			<NameInput
				label="Account Name"
				bind:this={accountInput}
				bind:ref={accountRef}
				bind:value={accountName}
				bind:valid={accountValid}
				id="account-input"
				placeholder="Account Name"
			/>

			<Fieldset>
				<Label for="account-input">Contract Files</Label>
				<!-- FileUploadProps is not generic over multiple, so the flag must be cast -->
				<FileUpload multiple={true as unknown as false} accept=".abi,.wasm" onAccept={set} />
			</Fieldset>

			<Button onclick={transact} disabled={actions.length === 0}>Upload</Button>

			{#if actions.length > 0}
				<h3 class="text-title">Actions</h3>
				<p>The actions that will be performed are listed below.</p>
				{#each actions as action, index}
					<Card class="mb-4" title={String(action.name)}>
						<Code json={action} />
						<Button variant="secondary" onclick={() => remove(index)}>Remove Action</Button>
					</Card>
				{/each}
			{/if}
		</TransactForm>
	</Stack>
</SingleCard>
