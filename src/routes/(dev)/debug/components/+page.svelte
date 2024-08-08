<script lang="ts">
	import { Sidebar, Stack } from '$lib/components/layout';
	import Typography from './sections/typography.svelte';
	import Buttons from './sections/buttons.svelte';
	import Select from './sections/select.svelte';
	import Inputs from './sections/inputs.svelte';
	import Cards from './sections/cards.svelte';
	import Navigation from './sections/navigation.svelte';
	import Code from './sections/code.svelte';
	import Layouts from './sections/layouts.svelte';
	import Pagemargin from '$lib/components/layout/box/pagemargin.svelte';
</script>

<Pagemargin>
	<Sidebar.Root>
		<Sidebar.Side width="10rem" tag="aside">
			<Stack id="toc" class="sticky top-4">
				<a href="#typography">Typography</a>
				<a href="#buttons">Buttons</a>
				<a href="#inputs">Inputs</a>
				<a href="#cards">Cards</a>
				<a href="#navigation">Navigation</a>
				<a href="#code">Code</a>
				<a href="#layout">Layout</a>
			</Stack>
		</Sidebar.Side>
		<Sidebar.Content tag="main" threshold="80%">
			<h1 class="h1 mb-8">Design System</h1>

			<Stack class="space-y-12">
				<Typography />

				<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

				<Buttons />

				<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

				<Select />

				<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

				<Inputs />

				<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

				<Cards />

				<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

				<Navigation />

				<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

				<Code />

				<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

				<Layouts />
			</Stack>
		</Sidebar.Content>
	</Sidebar.Root>
</Pagemargin>
