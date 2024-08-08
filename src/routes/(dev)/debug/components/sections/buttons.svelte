<script>
	import { Cluster, Stack } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
</script>

<Stack id="buttons">
	<h2 class="h2">Buttons</h2>
	<Stack class="items-start">
		<h3 class="h3">Primary</h3>
		<Cluster>
			<Stack class="gap-2">
				<p class="caption">Default</p>
				<Button variant="primary" onclick={() => {}}>EOS (0)</Button>
			</Stack>
			<Stack class="gap-2">
				<p class="caption">Disabled</p>
				<Button variant="primary" disabled onclick={() => {}}>EOS (0)</Button>
			</Stack>
		</Cluster>
	</Stack>
	<Stack class="items-start">
		<h3 class="h3">Secondary</h3>
		<Cluster>
			<Stack class="gap-2">
				<p class="caption">Default</p>
				<Button variant="secondary" onclick={() => {}}>EOS (1)</Button>
			</Stack>
			<Stack class="gap-2">
				<p class="caption">Disabled</p>
				<Button variant="secondary" disabled onclick={() => {}}>EOS (1)</Button>
			</Stack>
		</Cluster>
	</Stack>
	<Stack class="items-start">
		<h3 class="h3">Pill</h3>
		<Cluster>
			<Stack class="gap-1">
				<p class="caption">Default</p>
				<Button variant="pill" onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
			<Stack class="gap-1">
				<p class="caption">Active</p>
				<Button variant="pill" active={true} onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
		</Cluster>
	</Stack>
</Stack>
