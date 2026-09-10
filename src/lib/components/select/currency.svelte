<script lang="ts">
	import { getContext } from 'svelte';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';

	import { type MarketContext, type UnicoveContext } from '$lib/state/client.svelte';
	import { Select } from '@wharfkit/svelte-components';
	import type { ExtendedSelectOption } from '@wharfkit/svelte-components';
	import { SupportedCurrencies, SupportedCurrenciesList } from '$lib/types/currencies.js';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	const currencies: ExtendedSelectOption[] = SupportedCurrenciesList.map((c) => ({
		label: c,
		value: c
	}));
	let selectedCurrency: ExtendedSelectOption | undefined = $derived(
		currencies.find((r) => r.value === context.settings.data.displayCurrency)
	);
	const onCurrencySelectedChange: ChangeFn<ExtendedSelectOption | undefined> = ({ next }) => {
		context.settings.data.displayCurrency =
			(next?.value as SupportedCurrencies) || SupportedCurrencies.USD;
		market.market.refresh();
		return next;
	};
</script>

<Select
	id="display-currency"
	options={currencies}
	onSelectedChange={onCurrencySelectedChange}
	selected={selectedCurrency}
/>
