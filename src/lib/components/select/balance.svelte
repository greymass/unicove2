<script lang="ts">
	import { createSelect, type SelectOption } from '@melt-ui/svelte';
	import { SelectTrigger, SelectMenu, SelectItem } from '@wharfkit/svelte-components';
	import { writable } from 'svelte/store';
	import { TokenBalance, tokenEquals } from '$lib/types/token';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';
	import { Code } from '@wharfkit/svelte-components';

	interface BalanceSelectOption extends SelectOption<number> {
		image?: string;
	}

	interface Props {
		options: TokenBalance[];
		selected?: TokenBalance;
		debug?: boolean;
		id: string;
		disabled?: boolean;
		required?: boolean;
		multiple?: boolean;
		sameWidth?: boolean;
		class?: string;
		onSelectedChange?: ChangeFn<BalanceSelectOption | undefined>;
	}

	let {
		selected: _selected = $bindable(),
		id,
		options,
		debug = false,
		disabled = false,
		required = false,
		multiple = false,
		sameWidth = true,
		class: className = '',
		onSelectedChange
	}: Props = $props();

	const variant = 'form';

	const label = (balance: TokenBalance) =>
		`${String(balance.token.symbol.code)} (${balance.balance.quantity})`;

	const createOption = (balance: TokenBalance, index: number): BalanceSelectOption => {
		return {
			value: index,
			label: label(balance)
			// image: image(balance)
		};
	};

	// Convert the options to the format of SelectOption<number>
	// Using an index as the value instead of the TokenBalance object
	const balanceOptions: BalanceSelectOption[] = $derived(
		options.map((balance: TokenBalance, index) => createOption(balance, index))
	);

	// Create a typed store for the selected option
	let selectedBalanceOption = writable<BalanceSelectOption>();

	// Build the select component with the custom store
	const {
		elements: { trigger, menu, option },
		states: { open },
		helpers: { isSelected }
	} = createSelect({
		selected: selectedBalanceOption,
		onSelectedChange: ({ curr, next }) => {
			if (next) {
				_selected = options[next.value];
			}
			if (onSelectedChange) {
				return onSelectedChange({ curr, next });
			}
		},
		required,
		disabled,
		multiple,
		forceVisible: true,
		positioning: {
			placement: 'bottom-start',
			fitViewport: true,
			sameWidth
		}
	});

	/** Set the value from a parent */
	export function set(balance: TokenBalance | null) {
		if (!balance) {
			_selected = options[0];
			selectedBalanceOption.set(balanceOptions[0]);
		} else {
			_selected = balance;
			const option = balanceOptions.find((o) =>
				tokenEquals(options[o.value].token.id, balance.token.id)
			);
			if (option) {
				selectedBalanceOption.set(option);
			} else {
				selectedBalanceOption.set(balanceOptions[0]);
			}
		}
	}
</script>

<SelectTrigger {variant} {id} {open} {trigger} class={className}>
	<!-- {#if selectedTokenImage}
		<img src={selectedTokenImage} alt={$selectedLabel} class="mr-2 size-5 object-contain" />
	{/if} -->
	{_selected ? label(_selected) : 'Select an option'}
</SelectTrigger>

{#if $open}
	<SelectMenu {id} {variant} {menu} {open}>
		{#each balanceOptions as item}
			<SelectItem {id} {option} {variant} {item} {isSelected} />
		{/each}
	</SelectMenu>
{/if}

{#if debug}
	<Code
		json={{
			_selected,
			selectedBalanceOption,
			options,
			balanceOptions
		}}
	/>
{/if}
