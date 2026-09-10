<script>
	import { Button } from '@wharfkit/svelte-components';

	import { Card, Stack, Switcher } from '@wharfkit/svelte-components';
</script>

<Stack id="cards">
	<h2 class="text-headline">Cards</h2>

	<div class="flex justify-center">
		<Switcher threshold="40rem" class="items-start">
			<Card class="gap-5">
				<Stack class="gap-0">
					<p class="caption">Currently Staked - 34% APR</p>
					<p class="text-title">0.0 EOS</p>
					<p class="bg-on-surface-variant text-surface mt-1.5 self-start rounded-sm px-2">
						USD Value $0.0
					</p>
				</Stack>
				<Switcher threshold="20rem">
					<Button variant="secondary">Stake</Button>
					<Button variant="secondary">Unstake</Button>
				</Switcher>
			</Card>

			<Card title="Unstaking Balances Is A Long Title">
				<Button variant="secondary">Withdraw</Button>
			</Card>
		</Switcher>
	</div>
</Stack>
