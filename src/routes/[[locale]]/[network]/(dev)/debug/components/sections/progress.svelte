<script>
	import { Stack } from '@wharfkit/svelte-components';
	import Progress from '$lib/components/progress.svelte';
</script>

<Stack id="Progress">
	<h2 class="text-headline">Progress</h2>

	<Progress currentStep={1} maxStep={3} />
	<Progress currentStep={4} maxStep={6} />
</Stack>
