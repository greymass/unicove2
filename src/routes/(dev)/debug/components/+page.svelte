<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TextInput from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';
	import {
		Grid,
		Switcher,
		Sidebar,
		Cluster,
		Center,
		Box,
		Card,
		Stack
	} from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';
	import Code from '$lib/components/code.svelte';
	import BarChart from '$lib/components/chart/barchart.svelte';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);
</script>

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
			<Stack id="typography">
				<h2 class="h2">Typography</h2>
				<p>
					Styles are applied separately from their tag since there will be situations where we want
					to mix and match styles and tags. We want to adhere to valid and semantic html as much as
					possible, and having a utility class to apply heading styles helps us with that goal.
				</p>
				<p>
					For example, some of the designs show the main heading of the page using the style of a
					second heading. This is easily achieved by applying the h2 class to the h1 tag.
				</p>
				<Cluster class="items-center">
					<h1 class="h1">Heading 1 (Inter 48)</h1>
					<code class=" bg-gray-300 text-black rounded-lg p-2">class='h1'</code>
				</Cluster>
				<Cluster class="items-center">
					<h2 class="h2">Heading 2 (Inter 32)</h2>
					<code class=" bg-gray-300 text-black rounded-lg p-2">class='h2'</code>
				</Cluster>
				<Cluster class="items-center">
					<h3 class="h3">Heading 3 (Inter 24)</h3>
					<code class=" bg-gray-300 text-black rounded-lg p-2">class='h3'</code>
				</Cluster>
				<Cluster class="items-center">
					<h4 class="h4">Heading 4 (Inter 18)</h4>
					<code class=" bg-gray-300 text-black rounded-lg p-2">class='h4'</code>
				</Cluster>
				<Cluster class="items-center">
					<h5 class="h5">Heading 5 (Inter 16)</h5>
					<code class="bg-gray-300 text-black rounded-lg p-2">class='h5'</code>
				</Cluster>
				<Cluster class="items-center">
					<p class="caption">Caption (Inter 12)</p>
					<code class="bg-gray-300 text-black rounded-lg p-2">class='caption'</code>
				</Cluster>
				<p>
					Paragraph - lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
					incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
					exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
					dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
					Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
					anim id est laborum.
				</p>
			</Stack>

			<hr class="h-px my-8 bg-slate-200 border-0 dark:bg-slate-800" />

			<Stack id="buttons">
				<h2 class="h2">Buttons</h2>
				<Stack class="items-start">
					<h3 class="h3">Primary</h3>
					<Button variant="primary" onclick={() => input.set(Asset.from('0.0000 EOS'))}
						>EOS (0)</Button
					>
				</Stack>
				<Stack class="items-start">
					<h3 class="h3">Secondary</h3>
					<Button variant="secondary" onclick={() => input.set(Asset.from('1.0000 EOS'))}
						>EOS (1)</Button
					>
				</Stack>
				<Stack class="items-start">
					<h3 class="h3">Pill</h3>
					<Button variant="pill" onclick={() => input.set(Asset.from('2100000000.0000 EOS'))}>
						EOS (MAX)
					</Button>
				</Stack>
			</Stack>

			<hr class="h-px my-8 bg-slate-200 border-0 dark:bg-slate-800" />

			<Stack id="inputs">
				<Stack>
					<h2 class="h2">Text Input</h2>
					<div>
						<h3 class="h3">Default</h3>
						<TextInput placeholder="Placeholder text" />
					</div>
					<div>
						<h3 class="h3">With Label</h3>
						<fieldset class="grid gap-3">
							<Label>Enter a value</Label>
							<TextInput placeholder="Placeholder text" />
						</fieldset>
					</div>
				</Stack>

				<div>
					<h2 class="h2">Asset Input</h2>
					<Label for="assetInput">Enter token value:</Label>
					<AssetInput id="assetInput" bind:this={input} bind:value bind:valid bind:min bind:max />
				</div>
			</Stack>

			<hr class="h-px my-8 bg-slate-200 border-0 dark:bg-slate-800" />

			<Stack id="cards">
				<h2 class="h2">Cards</h2>

				<div class="flex justify-center">
					<Switcher threshold="40rem" class="items-start">
						<Card class="gap-5">
							<Stack class="gap-0">
								<p class="caption">Currently Staked - 34% APY</p>
								<p class="h3">0.0 EOS</p>
								<p class="bg-shark-800/60 rounded self-start px-2 mt-1.5">USD Value $0.0</p>
							</Stack>
							<Switcher threshold="20rem">
								<Button variant="secondary" class="text-skyBlue-500">Stake</Button>
								<Button variant="secondary" class="text-skyBlue-500">Unstake</Button>
							</Switcher>
						</Card>

						<Card title="Unstaking Balances Is A Long Title">
							<table class="table-auto">
								<thead class="border-b-2 border-shark-100/10">
									<tr class="caption font-medium">
										<th class="p-4 text-left">Amount</th>
										<th class="p-4 text-right">Date available</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td class="p-4">0 EOS</td>
										<td class="p-4 text-right">Not connected</td>
									</tr>
								</tbody>
							</table>
							<Button variant="secondary" class="text-skyBlue-500">Withdraw</Button>
						</Card>
					</Switcher>
				</div>
			</Stack>

			<hr class="h-px my-8 bg-slate-200 border-0 dark:bg-slate-800" />

			<Stack id="navigation">
				<h2 class="h2">Navigation Components</h2>
				<Stack>
					<h3 class="h3">Account Actions</h3>
					<AccountNavigation
						options={[
							{ href: '#navigation', text: 'Permissions' },
							{ href: '#navigation', text: 'RAM' },
							{ href: '#navigation', text: 'Resources', active: true },
							{ href: '#navigation', text: 'Send' },
							{ href: '#navigation', text: 'Transfer' },
							{ href: '#navigation', text: 'Vote' },
							{ href: '#navigation', text: 'Transactions' }
						]}
					/>
				</Stack>

				<Stack>
					<h3 class="h3">Page Actions</h3>
					<PillGroup options={['Overview', 'Stake', 'Unstake', 'Withdraw']} />
				</Stack>
			</Stack>

			<hr class="h-px my-8 bg-slate-200 border-0 dark:bg-slate-800" />

			<Stack id="code">
				<h2 class="h2">Code</h2>
				<p>We can use the code component to display JSON snippets. This is useful for debug.</p>
				<p>
					Here we have an inline code snippet: <Code inline>{`{ "key": "value" }`}</Code> surrounded
					by text.
				</p>
				<p>And here we have a block code snippet:</p>
				<Code>
					{`{
	"key": "value",
	"key2": "someReallyLongValueThatWeCanEitherWrapToTheNextLineOrPresentAScrollbarIfItDoesntFitInThisContainer",
}`}
				</Code>
			</Stack>

			<hr class="h-px my-8 bg-slate-200 border-0 dark:bg-slate-800" />
			
			<Stack id="charts">
				<h2 class="h2">Charts</h2>
				<h3 class="h3">Bar Chart</h3>
				<BarChart title="Staking Yield History" />
			</Stack>

			<hr class="h-px my-8 bg-slate-200 border-0 dark:bg-slate-800" />


			<Stack id="layout" class="space-y-8">
				<div>
					<h2 class="h2 mb-4">Layout Components</h2>
					<p>These are the basic layout components designed to be:</p>
					<ul class="list-disc list-inside">
						<li>Atomically Composable</li>
						<li>Intrisically Responsive</li>
						<li>Accessible</li>
					</ul>
					<p>We should default to these to create the structure of pages and other components.</p>
				</div>

				<Stack>
					<h3 class="h3">Box</h3>
					<Card>
						<p>
							Adds default padding to both horizontal and vertical axes. The Card component is an
							example of a Box with some additional styling.
						</p>
					</Card>
				</Stack>

				<Stack>
					<h3 class="h3">Center</h3>
					<Center>
						<Card class="box-content max-w-prose">
							<Stack>
								<p>
									Switches the context to content-box and centers the element. No padding by default
									so add a px-4 or similar to avoid being flush to the edge, depending on context.
								</p>
								<p>
									Includes a default maximum width which can be overridden with the max-w- tailwind
									class.
								</p>
								<p class="text-center">
									Centering text inside a Center component is simply done with a text-center
									tailwind class on the child, allowing more flexibility depending on context.
								</p>
							</Stack>
						</Card>
					</Center>
				</Stack>

				<Stack>
					<h3 class="h3">Stack</h3>
					<p>Stacks children vertically with a default gap.</p>
					<p>Box > Center > Stack will be a common pattern for creating page layouts.</p>
					<p>Note: no leading or trailing vertical gap.</p>
					<Stack>
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3</p>
						</Card>
					</Stack>

					<p>You can push items to the top or bottom of the stack by using mt-auto or mb-auto</p>
					<Stack class="h-96">
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2 - Then a big gap to the bottom of the element</p>
						</Card>
						<Card class="bg-red-900 mt-auto">
							<p>Child 3</p>
						</Card>
					</Stack>
				</Stack>

				<Stack>
					<h3 class="h3">Sidebar</h3>
					<p>
						The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width,
						the other filling the remaining space. In a narrow context the elements will stack
						vertically.
					</p>
					<p>It is a common pattern to use a Sidebar with a Stack to create a page layout.</p>
					<Sidebar.Root>
						<Sidebar.Side width="20rem" tag="aside">
							<Card title="Sidebar">
								<p>This is the sidebar content set to 20rem</p>
							</Card>
						</Sidebar.Side>
						<Sidebar.Content tag="main" threshold="50%">
							<Card title="Main Content" class="">
								<Stack>
									<p>This is the main content set to break at 50%</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
								</Stack>
							</Card>
						</Sidebar.Content>
					</Sidebar.Root>

					<p>
						We can also have the Sidebar on the right side, and choose to wrap above or below the
						main content with flex-wrap-reverse
					</p>

					<!-- <Sidebar.Root class='flex-wrap-reverse'> -->
					<Sidebar.Root>
						<Sidebar.Content tag="main" threshold="50%">
							<Card title="Main Content">
								<Stack>
									<p>This is the main content set to break at 50%</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
								</Stack>
							</Card>
						</Sidebar.Content>
						<Sidebar.Side tag="aside" width="10rem">
							<Card title="Sidebar">
								<p>This is the sidebar content set to 10rem</p>
							</Card>
						</Sidebar.Side>
					</Sidebar.Root>
				</Stack>

				<Stack>
					<h3 class="h3">Cluster</h3>
					<p>
						Clusters children horizontally with a default gap. The cluster will re-flow when the
						screen size changes.
					</p>
					<p>This is essentially just typical flex-wrap behaviour with some default gaps.</p>
					<p>Note: no leading or trailing horizontal gap.</p>
					<Cluster>
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2 is larger</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3 is also large</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 4</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 5</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 6</p>
						</Card>
					</Cluster>
				</Stack>

				<Stack>
					<h3 class="h3">Switcher</h3>
					<p>
						The Switcher switches a flexbox context between horizontal and a vertical layout at a
						given, parent container-based breakpoint.
					</p>
					<p>
						For example, if the breakpoint is 30rem the layout will switch to vertical when the
						parent container itself is less than 30rem wide.
					</p>
					<p>
						This layout is useful when all elements inside the switcher are considered of equal
						importance.
					</p>

					<Switcher threshold="30rem">
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3</p>
						</Card>
					</Switcher>
				</Stack>

				<Stack>
					<h3 class="h3">Grid</h3>
					<p>
						The Grid component is used to create a grid layout with a default gap between children.
					</p>
					<p>
						The grid is different from the Cluster component in that all children are the same size
						and will align to columns.
					</p>
					<p>On a small screen, these will form a single column whereas the cluster will not.</p>
					<Grid>
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 4</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 5</p>
						</Card>
					</Grid>
				</Stack>
			</Stack>
		</Stack>
	</Sidebar.Content>
</Sidebar.Root>
