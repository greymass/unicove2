<script lang="ts">
	import { Asset, Name, Serializer } from '@wharfkit/antelope';
	import { NameInput } from '@wharfkit/svelte-components';
	import { SymbolInput } from '@wharfkit/svelte-components';
	import { TokenDefinition } from '$lib/types/token';
	import { Button } from '@wharfkit/svelte-components';
	import { onMount } from 'svelte';
	import { Code } from '@wharfkit/svelte-components';

	const { data } = $props();

	class TokenDefinitionInput {
		contract: Name = $state(Name.from(''));
		contractValid: boolean = $state(false);
		symbol: Asset.Symbol = $state(Asset.Symbol.from('4,SYS'));
		symbolValid: boolean = $state(false);

		def() {
			return TokenDefinition.from({
				contract: this.contract,
				symbol: this.symbol
			});
		}

		valid() {
			return this.contractValid && this.symbolValid;
		}

		toJSON() {
			return {
				contract: this.contract,
				contractValid: this.contractValid,
				symbol: this.symbol,
				symbolValid: this.symbolValid
			};
		}
	}
	const tokenDefinitionInputs: TokenDefinitionInput[] = $state([]);

	const tokenDefinitions = $derived(
		tokenDefinitionInputs.map((tokenDefinition) => tokenDefinition.def())
	);

	const payload = $derived.by(() => {
		try {
			return Serializer.encode({
				object: tokenDefinitions,
				type: 'token_definition[]',
				customTypes: [TokenDefinition]
			});
		} catch (e) {
			console.error(e);
			return undefined;
		}
	});

	function add() {
		tokenDefinitionInputs.push(new TokenDefinitionInput());
	}

	onMount(() => {
		if (data.params.payload) {
			const decoded = Serializer.decode({
				type: 'token_definition[]',
				data: data.params.payload,
				customTypes: [TokenDefinition]
			});
			(decoded as TokenDefinition[]).forEach((tokenDefinition) => {
				const tokenDefinitionInput = new TokenDefinitionInput();
				tokenDefinitionInput.contract = tokenDefinition.contract!;
				tokenDefinitionInput.contractValid = true;
				tokenDefinitionInput.symbol = tokenDefinition.symbol;
				tokenDefinitionInput.symbolValid = true;
				tokenDefinitionInputs.push(tokenDefinitionInput);
			});
		}
	});
</script>

<p>Build an array of TokenDefinition objects</p>

<Button onclick={add}>+</Button>

{#each tokenDefinitionInputs as tokenDefinition, index}
	<div class="bg-surface-container-high m-4 flex flex-col gap-2 rounded-lg p-4">
		<NameInput
			id="contract-{index}"
			placeholder="Contract Name"
			bind:value={tokenDefinition.contract}
			bind:valid={tokenDefinition.contractValid}
		/>
		<SymbolInput
			id="symbol-{index}"
			placeholder="Token Symbol"
			bind:value={tokenDefinition.symbol!}
			bind:valid={tokenDefinition.symbolValid}
		/>
	</div>
{/each}

<Code json={{ tokenDefinitionInputs, tokenDefinitions, payload }} />
