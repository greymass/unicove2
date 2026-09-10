<script lang="ts">
	import { Cluster, Stack } from '@wharfkit/svelte-components';
	import { Select, type ExtendedSelectOption } from '@wharfkit/svelte-components';
	import { Label } from '@wharfkit/svelte-components';
	import { Chains } from '@wharfkit/common';
	import TokenSelect from '$lib/components/select/balance.svelte';
	import type { SelectOption } from '@melt-ui/svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
	import { TokenBalance } from '$lib/types/token';

	const options: SelectOption[] = [
		{ value: 30, label: '30d' },
		{ value: 60, label: '60d' },
		{ value: 90, label: '90d' },
		{ value: 365, label: '365d' }
	];
	let selected = $state(options[0]);

	const formOptions: SelectOption[] = [
		{ value: 30, label: '30d' },
		{ value: 60, label: '60d' },
		{ value: 90, label: '90d' },
		{ value: 365, label: '365d' }
	];
	let selectedFormOption = $state(formOptions[1]);

	const imageOptions: ExtendedSelectOption[] = [
		{ value: Chains.EOS.id, label: Chains.EOS.name, image: String(Chains.EOS.getLogo()) },
		{
			value: Chains.Jungle4.id,
			label: Chains.Jungle4.name,
			image: String(Chains.Jungle4.getLogo())
		},
		{
			value: Chains.KylinTestnet.id,
			label: Chains.KylinTestnet.name,
			image: String(Chains.KylinTestnet.getLogo())
		},
		{ value: Chains.FIO.id, label: Chains.FIO.name, image: String(Chains.FIO.getLogo()) },
		{ value: Chains.Telos.id, label: Chains.Telos.name, image: String(Chains.Telos.getLogo()) },
		{ value: Chains.WAX.id, label: Chains.WAX.name, image: String(Chains.WAX.getLogo()) },
		{ value: Chains.Proton.id, label: Chains.Proton.name, image: String(Chains.Proton.getLogo()) }
	];
	let imageOptionSelected = $state(imageOptions[0]);

	const tokenOptions: TokenBalance[] = [
		TokenBalance.from({
			balance: '1.2345 EOS',
			token: {
				id: {
					chain: Chains.EOS.id,
					contract: 'eosio.token',
					symbol: '4,EOS'
				}
			}
		}),
		TokenBalance.from({
			balance: '9876 SCRAP',
			token: {
				id: {
					chain: Chains.EOS.id,
					contract: 'scrap',
					symbol: '0,SCRAP'
				}
			}
		})
	];
	let tokenSelected = $state(tokenOptions[0]);
</script>

<Stack id="select">
	<h2 class="text-headline">Select</h2>

	<Stack class="items-start">
		<h3 class="text-title">Pill Select</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="date-range">Select a date range</Label>
				<Select id="date-range" {options} bind:selected />
			</Stack>
			<span>Value in parent: {selected.label}</span>
			<Button onclick={() => (selected = options[2])}>Test set to 90d</Button>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="text-title">Form Select</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="form-select">Select a form option</Label>
				<Select
					variant="form"
					id="form-select"
					options={formOptions}
					bind:selected={selectedFormOption}
				/>
			</Stack>
			<span>Value in parent: {selectedFormOption.label}</span>
			<Stack class="gap-2">
				<Label for="form-select-1">Disabled</Label>
				<Select
					variant="form"
					id="form-select-1"
					options={formOptions}
					disabled
					bind:selected={selectedFormOption}
				/>
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="text-title">Form Select with Images</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="image-select">Select an option</Label>
				<Select
					variant="form"
					id="image-select"
					options={imageOptions}
					bind:selected={imageOptionSelected}
					sameWidth={false}
				/>
			</Stack>
			<span>Value in parent: {imageOptionSelected.label}</span>
		</Cluster>
	</Stack>

	<Stack>
		<h3 class="text-title">Token Select</h3>
		<Stack class="gap-2">
			<Label for="token-select">Select a token</Label>
			<TokenSelect
				id="token-select"
				class="self-start"
				options={tokenOptions}
				bind:selected={tokenSelected}
			/>
			<Code>Value in parent: {JSON.stringify(tokenSelected, null, 2)}</Code>
		</Stack>
	</Stack>
</Stack>
