<script>
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';
	import Account from '$lib/components/elements/account.svelte';
	import { Card, Stack } from '@wharfkit/svelte-components';

	const items = [
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' }
	];
</script>

<Stack id="tables" class="gap-8">
	<h2 class="text-headline">Tables and table-like displays</h2>

	<Stack>
		<h3 class="text-title">Description List</h3>

		<p>
			For a simple two-column key-value type table we can use the description list component. This
			will collapse the value under the key and right-align it on smaller screens. Note there is no
			row striping here.
		</p>

		<Card class="max-w-md" title="Some items">
			<DL {items} />
		</Card>

		<p>
			For displaying a component in the description, or multiple values under a single key, you can
			use the components declaratively.
		</p>

		<p>
			Note: You need to wrap the child component correctly or you'll get a warning. There are CSS
			rules that'll visually yell at you to fix it :)
		</p>

		<div class="max-w-md">
			<DL>
				<DLRow title="First">
					<DD>
						<Account name={'teamgreymass'} />
					</DD>
				</DLRow>
				<DLRow title="Second">
					<DD>
						<Account name={'unicove.gm'} />
					</DD>
					<DD>
						<Account name={'test.gm'} />
					</DD>
				</DLRow>
				<DLRow title="Warning">
					<Account name={'unicove.gm'} />
				</DLRow>
			</DL>
		</div>
	</Stack>
</Stack>
