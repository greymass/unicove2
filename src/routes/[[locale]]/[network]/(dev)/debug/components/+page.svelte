<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import Typography from './sections/typography.svelte';
	import Buttons from './sections/buttons.svelte';
	import SelectSection from './sections/select.svelte';
	import Inputs from './sections/inputs.svelte';
	import Cards from './sections/cards.svelte';
	import Navigation from './sections/navigation.svelte';
	import CodeSection from './sections/code.svelte';
	import Progress from './sections/progress.svelte';
	import Tables from './sections/tables.svelte';
	import Charts from './sections/charts.svelte';
	import Tooltips from './sections/tooltips.svelte';
	import Chips from './sections/chips.svelte';
	import Colors from './sections/colors.svelte';
</script>

<h1 class="text-display mb-8">Design System</h1>

{#snippet divider()}
	<hr class="bg-outline my-8 h-px border-0" />
{/snippet}

<Stack class="space-y-12 pb-12">
	<Typography />

	{@render divider()}

	<Colors />

	{@render divider()}

	<Buttons />

	{@render divider()}

	<Chips />

	{@render divider()}

	<Cards />

	{@render divider()}

	<Navigation />

	{@render divider()}

	<Progress />

	{@render divider()}

	<CodeSection />

	{@render divider()}

	<Tables />

	{@render divider()}

	<Charts />

	{@render divider()}

	<SelectSection />

	{@render divider()}

	<Inputs />

	{@render divider()}

	<Tooltips />
</Stack>
