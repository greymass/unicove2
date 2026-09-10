<script lang="ts">
	import Self from './fields.svelte';
	import { Checkbox } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';
	import { TextInput } from '@wharfkit/svelte-components';
	import type { ABI } from '@wharfkit/antelope';

	interface PageProps {
		abi: ABI;
		codePath?: string[];
		fields: ABI.Field[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		state?: Record<string, any>;
	}
	const { abi, codePath = [], fields, state = $bindable({}) }: PageProps = $props();

	function deriveFields(fieldType: string) {
		const baseType = fieldType.replace('?', '');
		const struct = abi.structs.find((s: ABI.Struct) => s.name === baseType);
		if (struct) {
			return struct.fields;
		}
		return [];
	}
</script>

<div class="mt-4 space-y-4">
	{#each fields as field}
		{@const subfields = deriveFields(field.type)}
		{#if subfields.length > 0}
			<Self {abi} codePath={[...codePath, field.name]} fields={subfields} {state} />
		{:else}
			{@const fieldName = [...codePath, field.name].join('->')}
			{#if field.type === 'bool'}
				<fieldset class="flex items-center gap-3">
					<Checkbox id="{fieldName}-input" bind:checked={state[fieldName]} />
					<Label for="{fieldName}-input">
						{fieldName} ({field.type})
					</Label>
				</fieldset>
			{:else}
				<fieldset class="grid gap-2">
					<Label for="{fieldName}-input">
						{fieldName} ({field.type})
					</Label>
					<TextInput
						bind:value={state[fieldName]}
						placeholder={field.name}
						id="{fieldName}-input"
					/>
				</fieldset>
			{/if}
		{/if}
	{/each}
</div>
