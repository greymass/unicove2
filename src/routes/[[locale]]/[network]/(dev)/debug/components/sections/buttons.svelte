<script lang="ts">
	import { Cluster, Stack } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import { IconButton } from '@wharfkit/svelte-components';
	import { User } from '@lucide/svelte';
</script>

<Stack id="buttons">
	<Cluster>
		<h2 class="text-headline">Buttons</h2>
	</Cluster>

	<Stack class="items-start">
		<h3 class="text-title">Primary</h3>
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
		<h3 class="text-title">Secondary</h3>
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
		<h3 class="text-title">Pill</h3>
		<Cluster>
			<Stack class="gap-1">
				<p class="caption">Default</p>
				<Button variant="pill" onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
			<Stack class="gap-1">
				<p class="caption">Active</p>
				<Button variant="pill" aria-current={true} onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="text-title">Text</h3>
		<Cluster>
			<Stack class="gap-1">
				<p class="caption">Default</p>
				<Button variant="text" onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
			<Stack class="gap-1">
				<p class="caption">Disabled</p>
				<Button variant="text" disabled onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="text-title">Side by side</h3>
		<Cluster class="items-center">
			<Button variant="text" onclick={() => {}}>Delete</Button>
			<Button variant="secondary" onclick={() => {}}>Cancel</Button>
			<Button variant="primary" onclick={() => {}}>Confirm</Button>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="text-title">Icon Buttons</h3>
		<Cluster>
			<IconButton size="large" icon={User} onclick={() => {}}>Cancel</IconButton>
			<IconButton icon={User} onclick={() => {}}>Cancel</IconButton>
		</Cluster>
	</Stack>
</Stack>
