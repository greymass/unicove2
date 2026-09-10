<script lang="ts">
	import { Button } from '@wharfkit/svelte-components';
</script>

<div class="space-y-4">
	<h3 class="text-headline">Example Transactions (Vaulta)</h3>
	<p>Links to transactions that perform common types of actions.</p>
	<h4 class="text-title">Tokens</h4>
	<Button
		href="/vaulta/transaction/7e933eb4e4f0833adda84b2ef1f39f4ee394da641c29bda685257f280c180913"
	>
		Token Transfer
	</Button>
	<Button
		href="/vaulta/transaction/ff0ad8a1d9c42290a4217334966e2c3a5cf8075551576fb1fd79fc0144767407"
	>
		Swap System Token to RAM
	</Button>
	<Button
		href="/vaulta/transaction/88cd151f119e689868f2309718f9af4669db58e79987e60256a80a81280ff19b"
	>
		Swap RAM to System Token
	</Button>
	<Button
		href="/vaulta/transaction/96b3dab868340b32cb44ed2b61cbd82e61eaf4fdcf2c30ed22013dbeb7318aec"
	>
		Swap RAM to WRAM
	</Button>
	<Button
		href="/vaulta/transaction/b09713eec856b404bf8f7964fed53034d29da7b3601874728e1e51e9f2c98eff"
	>
		Swap WRAM to RAM
	</Button>
	<h4 class="text-title">Staking</h4>
	<Button
		href="/vaulta/transaction/2395e0048b2d6e48d42078864c567a6723dd00dbf0da3befb05df9dff8b60cd2"
	>
		Stake System Token
	</Button>
	<Button
		href="/vaulta/transaction/89da6425329f56fd65e52b4c72690102f988853bae37592d08f72ca64f5cce3a"
	>
		Unstake System Token
	</Button>
	<Button
		href="/vaulta/transaction/7336d3fada74bc0e19051828ee0203b66163ce1e2ec3b50ac25cf83e931f8169"
	>
		Staking Withdraw
	</Button>
	<h4 class="text-title">Resources</h4>
	<Button
		href="/vaulta/transaction/22ee566f47e72aa5f293def5f126a9498e1a2a988df5f61f0dc6938e3aaef2e0"
	>
		Powerup
	</Button>
</div>
