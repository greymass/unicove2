<script>
	import { Stack } from '@wharfkit/svelte-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
</script>

<Stack id="navigation">
	<h2 class="text-headline">Navigation Components</h2>

	<!-- NOTE: Currently unused -->
	<!-- <Stack> -->
	<!-- 	<h3 class="text-title">Account Actions</h3> -->
	<!-- 	<AccountNavigation -->
	<!-- 		options={[ -->
	<!-- 			{ href: '#navigation', text: 'Permissions' }, -->
	<!-- 			{ href: '#navigation', text: 'RAM' }, -->
	<!-- 			{ href: '#navigation', text: 'Resources', active: true }, -->
	<!-- 			{ href: '#navigation', text: 'Send' }, -->
	<!-- 			{ href: '#navigation', text: 'Transfer' }, -->
	<!-- 			{ href: '#navigation', text: 'Vote' }, -->
	<!-- 			{ href: '#navigation', text: 'Transactions' } -->
	<!-- 		]} -->
	<!-- 	/> -->
	<!-- </Stack> -->

	<Stack>
		<h3 class="text-title">Page Actions</h3>
		<PillGroup
			options={[
				{ href: '#', text: 'Overview' },
				{ href: '#', text: 'Stake' },
				{ href: '#', text: 'Unstake' },
				{ href: '#', text: 'Withdraw' }
			]}
		/>
	</Stack>
</Stack>
