<script lang="ts">
	import { Card, Stack } from '@wharfkit/svelte-components';

	interface EmptyStateProps {
		title: string;
		message: string;
	}

	const { title, message }: EmptyStateProps = $props();
</script>

<Card>
	<Stack class="gap-2 text-center">
		<h3 class="text-title">{title}</h3>
		<p class="text-muted">{message}</p>
	</Stack>
</Card>
