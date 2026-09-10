<script>
	import { Cluster, Stack } from '@wharfkit/svelte-components';
</script>

<Stack id="typography">
	<h2 class="text-headline">Typography</h2>
	<p>
		Styles are applied separately from their tag since there will be situations where we want to mix
		and match styles and tags. We want to adhere to valid and semantic html as much as possible, and
		having a utility class to apply heading styles helps us with that goal.
	</p>
	<p>
		For example, some of the designs show the main heading of the page using the style of a second
		heading. This is easily achieved by applying the h2 class to the h1 tag.
	</p>
	<Cluster class="items-center">
		<p class="text-display text-on-surface">Text Display</p>
		<code class=" bg-surface-container-highest text-on-surface rounded-lg p-2"
			>class='text-display'</code
		>
	</Cluster>
	<Cluster class="items-center">
		<p class="text-headline text-on-surface">Text Headline</p>
		<code class=" bg-surface-container-highest text-on-surface rounded-lg p-2"
			>class='text-headline'</code
		>
	</Cluster>
	<Cluster class="items-center">
		<p class="text-title text-on-surface">Text Title</p>
		<code class=" bg-surface-container-highest text-on-surface rounded-lg p-2"
			>class='text-title'</code
		>
	</Cluster>
	<Cluster class="items-center">
		<p class="text-body text-on-surface">Text Body</p>
		<code class=" bg-surface-container-highest text-on-surface rounded-lg p-2"
			>class='text-body'</code
		>
	</Cluster>
	<Cluster class="items-center">
		<p class="text-label text-on-surface">Text Label</p>
		<code class="bg-surface-container-highest text-on-surface rounded-lg p-2"
			>class='text-label'</code
		>
	</Cluster>
	<Cluster class="items-center">
		<p class="text-label-sm">Text Label Small</p>
		<code class="bg-surface-container-highest text-on-surface rounded-lg p-2"
			>class='text-label-sm'</code
		>
	</Cluster>
	<p>
		Paragraph - lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
		incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
		ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
		in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
		cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
	</p>
</Stack>
