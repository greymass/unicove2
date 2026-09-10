<script lang="ts">
	import { BlockTimestamp } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';

	import { Switch } from '@wharfkit/svelte-components';
	import LanguageSelect from '$lib/components/select/language.svelte';
	import { Label } from '@wharfkit/svelte-components';
	import { Card, Stack } from '@wharfkit/svelte-components';
	import { type UnicoveContext } from '$lib/state/client.svelte';
	import { Code } from '@wharfkit/svelte-components';
	import Pageheader from '$lib/components/pageheader.svelte';
	import { Select } from '@wharfkit/svelte-components';
	import type { ExtendedSelectOption } from '@wharfkit/svelte-components';
	import { TimeSeconds } from '$lib/state/settings.svelte.js';
	import { DatetimeInput } from '@wharfkit/svelte-components';
	import type { FormEventHandler } from 'svelte/elements';
	import { Button } from '@wharfkit/svelte-components';
	import CurrencySelect from '$lib/components/select/currency.svelte';
	import DebugToggle from '$lib/components/select/debug.svelte';
	import SchemeToggle from '$lib/components/select/scheme.svelte';
	import type { ActionDisplayVariants } from '$lib/types';

	const context = getContext<UnicoveContext>('state');

	let preventAccountPageSwitching = $state(!!context.settings.data.preventAccountPageSwitching);
	let searchAccountSwitch = $state(!!context.settings.data.searchAccountSwitch);
	let searchShowPages = $state(!!context.settings.data.searchShowPages);
	let developerMode = $state(!!context.settings.data.developerMode);
	let mockPrice = $state(!!context.settings.data.mockPrice);
	let increasedPrecision = $state(!!context.settings.data.increasedPrecision);
	let warnSuspiciousMemos = $state(context.settings.data.warnSuspiciousMemos !== false);

	const activityDisplayOptions: ExtendedSelectOption[] = [
		{ label: 'Summary', value: 'summary' },
		{ label: 'Table', value: 'table' },
		{ label: 'Action Data', value: 'pretty' }
	];

	let selectedActivityDisplay: ExtendedSelectOption = $derived(
		activityDisplayOptions.find((o) => o.value === context.settings.data.actionDisplayVariant) ||
			activityDisplayOptions[1]
	);

	const onActivityDisplayChange: ChangeFn<ExtendedSelectOption | undefined> = ({ next }) => {
		if (next) {
			context.settings.data.actionDisplayVariant = next.value as ActionDisplayVariants;
		}
		return next;
	};

	let refEarliestExecution: DatetimeInput | undefined = $state();

	let { data } = $props();

	$effect(() => {
		context.settings.data.preventAccountPageSwitching = preventAccountPageSwitching;
	});

	$effect(() => {
		context.settings.data.searchAccountSwitch = searchAccountSwitch;
	});

	$effect(() => {
		context.settings.data.searchShowPages = searchShowPages;
	});

	$effect(() => {
		context.settings.data.developerMode = developerMode;
	});

	$effect(() => {
		context.settings.data.increasedPrecision = increasedPrecision;
	});

	$effect(() => {
		context.settings.data.mockPrice = mockPrice;
	});

	$effect(() => {
		context.settings.data.warnSuspiciousMemos = warnSuspiciousMemos;
	});

	const range: ExtendedSelectOption[] = [
		{ label: '15 minutes', value: TimeSeconds['15m'] },
		{ label: '1 day', value: TimeSeconds['1d'] },
		{ label: '1 week', value: TimeSeconds['1w'] },
		{ label: '1 month', value: TimeSeconds['1mo'] },
		{ label: '1 year', value: TimeSeconds['1y'] }
	];
	const defaultRangeIndex = 3;

	let expireSeconds = $derived(context.wharf.session?.walletPlugin.data.expireSeconds);

	let selectedRange: ExtendedSelectOption = $derived(
		range.find((r) => r.value === expireSeconds) || range[defaultRangeIndex]
	);

	const onExpireSelectedChange: ChangeFn<ExtendedSelectOption | undefined> = ({ next }) => {
		if (context.wharf.session) {
			context.wharf.setWalletSetting('expireSeconds', next?.value || TimeSeconds['1mo']);
		}
		return next;
	};

	let earliestExecution: Date | undefined = $derived(
		context.wharf.session?.walletPlugin.data.earliestExecution
	);

	let timestamp = $derived(
		earliestExecution ? BlockTimestamp.fromDate(new Date(earliestExecution)) : undefined
	);

	const onEarliestExecutionChange: FormEventHandler<HTMLInputElement> = (event) => {
		context.wharf.setWalletSetting(
			'earliestExecution',
			event.currentTarget.value ? new Date(`${event.currentTarget.value}:00.000`) : undefined
		);
	};

	function clearEarliestExecution() {
		refEarliestExecution?.set(undefined);
		context.wharf.setWalletSetting('earliestExecution', undefined);
	}
</script>

<Stack tag="article" class="gap-6">
	<Pageheader network={data.network} title="Settings" subtitle="Configure Unicove" />
	<div class="grid max-w-2xl gap-8">
		{#if context.wharf.session?.walletPlugin.id === 'wallet-plugin-multisig'}
			<Card class=" grid gap-8 ">
				<div class="flex items-center justify-between">
					<h2 class="text-muted text-2xl font-semibold">MSIG Configuration</h2>
				</div>
				<div class="flex items-center justify-between">
					<Stack class="gap-2">
						<Label for="proposal-expiration">Proposal Expiration</Label>
						<p class="caption text-sm">The expiration date set on multisig proposals.</p>
					</Stack>
					<Select
						id="proposal-expiration"
						options={range}
						onSelectedChange={onExpireSelectedChange}
						selected={selectedRange}
					/>
				</div>
				<fieldset class="grid gap-4">
					<Label for="search-show-pages">Proposal Earliest Execution</Label>
					<p class="caption text-sm">
						Set a datetime to specify the earliest a proposal can be executed. This value will be
						reset after each proposal is created.
					</p>
					<DatetimeInput
						bind:this={refEarliestExecution}
						oninput={onEarliestExecutionChange}
						date={earliestExecution}
					>
						Local&nbsp;Time
					</DatetimeInput>
					{#if timestamp}
						<p class="text-sm">
							Set for UTC: {timestamp}
							<Button variant="pill" onclick={clearEarliestExecution}>Clear</Button>
						</p>
					{/if}
				</fieldset>
			</Card>
		{/if}

		<Card class=" grid gap-8 ">
			<div class="flex items-center justify-between">
				<h2 class="text-muted text-2xl font-semibold">Preferences</h2>
			</div>
			<div class="flex items-center justify-between gap-2">
				<Stack class="gap-2">
					<Label for="language-select">Language Selector</Label>
					<p class="caption text-sm">The language used throughout Unicove.</p>
				</Stack>
				<LanguageSelect />
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="proposal-expiration">Prefered Currency</Label>
					<p class="caption text-sm">The currency used to display the value of tokens.</p>
				</Stack>
				<CurrencySelect />
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="increased-precision">Increased Precision</Label>
					<p class="caption text-sm">Use more decimals to increase currency precision.</p>
				</Stack>
				<Switch id="increased-precision" bind:checked={increasedPrecision} />
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="color-scheme">Dark Mode</Label>
					<p class="caption text-sm text-balance">
						Toggle site wide dark mode independent from operating system preferences.
					</p>
				</Stack>
				<SchemeToggle />
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="activity-display">Activity Display Format</Label>
					<p class="caption text-sm">The default view format for account activity.</p>
				</Stack>
				<Select
					id="activity-display"
					options={activityDisplayOptions}
					onSelectedChange={onActivityDisplayChange}
					selected={selectedActivityDisplay}
				/>
			</div>

			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="warn-suspicious-memos">Warn about suspicious memos</Label>
					<p class="caption text-sm">
						Show warnings when transaction memos contain potential phishing content.
					</p>
				</Stack>
				<Switch id="warn-suspicious-memos" bind:checked={warnSuspiciousMemos} />
			</div>
		</Card>

		<Card class=" grid gap-8 ">
			<div class="flex items-center justify-between">
				<h2 class="text-muted text-2xl font-semibold">Navigation</h2>
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="search-show-pages">Allow page navigation in search prompt</Label>
					<p class="caption text-sm">Adds popular Unicove pages to search results.</p>
				</Stack>
				<Switch id="search-show-pages" bind:checked={searchShowPages} />
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="search-account-switch">Allow account switching in search prompt</Label>
					<p class="caption text-sm">
						Adds logged in accounts to search results for quick switching.
					</p>
				</Stack>
				<Switch id="search-account-switch" bind:checked={searchAccountSwitch} />
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="prevent-account-page-switching"
						>Remain on current page when switching accounts</Label
					>
					<p class="caption text-sm">
						Prevents the automatic navigation to the account overview page
					</p>
				</Stack>
				<Switch id="prevent-account-page-switching" bind:checked={preventAccountPageSwitching} />
			</div>
		</Card>

		<Card class=" grid gap-8 ">
			<div class="flex items-center justify-between">
				<h2 class="text-muted text-2xl font-semibold">Developer</h2>
			</div>
			<div class="flex items-center justify-between">
				<Stack class="gap-2">
					<Label for="debug-mode">Enable Developer Mode</Label>
					<p class="caption text-sm">Allow usage of settings meant for development of Unicove</p>
				</Stack>
				<Switch id="debug-mode" bind:checked={developerMode} />
			</div>
			{#if developerMode}
				<div class="flex items-center justify-between">
					<Stack class="gap-2">
						<Label for="debug-mode">Mock token price</Label>
						<p class="caption text-sm text-balance">
							Force the system token price to equal $1.2345 USD for testing in environments without
							pricing information.
						</p>
					</Stack>
					<Switch id="mock-price" bind:checked={mockPrice} />
				</div>
				<div class="flex items-center justify-between">
					<Stack class="gap-2">
						<Label for="debug-mode">Debug Data Display</Label>
						<p class="caption text-sm"></p>
					</Stack>
					<DebugToggle />
				</div>
			{/if}
		</Card>
	</div>
	{#if context.settings.data.debugMode}
		<Code>{JSON.stringify(context.settings.data, null, 2)}</Code>
	{/if}
</Stack>
