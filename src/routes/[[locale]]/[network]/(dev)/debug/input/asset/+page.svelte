<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { AssetInput } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 FOO'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);
</script>

<Stack class="items-start">
	<span>
		<Button variant="secondary" onclick={() => input.set(Asset.from('0.0000 EOS'))}>EOS (0)</Button>
		<Button variant="secondary" onclick={() => input.set(Asset.from('1.0000 EOS'))}>EOS (1)</Button>
		<Button variant="secondary" onclick={() => input.set(Asset.from('2100000000.0000 EOS'))}>
			EOS (MAX)
		</Button>

		<Button variant="secondary" onclick={() => input.set(Asset.from('46116860184.27387903 WAX'))}>
			WAX (MAX)
		</Button>
		<Button variant="secondary" onclick={() => input.set(Asset.from('0 FOO'))}>No Decimals</Button>
		<Button variant="secondary" onclick={() => input.set(Asset.from('4611686018427387903 TEST'))}>
			Maximum No Decimals
		</Button>
		<Button variant="secondary" onclick={() => input.set(Asset.from('461168601842738.7903 TEST'))}>
			Maximum 4 Decimals
		</Button>
		<Button variant="secondary" onclick={() => input.set(Asset.from('46116860184.27387903 TEST'))}>
			Maximum 8 Decimals
		</Button>
	</span>

	<div>
		<label>
			Minimum
			<input type="number" bind:value={min} />
		</label>
	</div>

	<div>
		<label>
			Maximum
			<input type="number" bind:value={max} />
		</label>
	</div>

	<Button disabled={!valid} onclick={() => alert(value)}>Do a thing with the token!</Button>

	<div>
		<label>
			Enter token value:
			<AssetInput bind:this={input} autofocus bind:value bind:valid bind:min bind:max debug />
		</label>
	</div>

	<div>
		<h3>Page State</h3>
		<pre>
			Valid Input: {valid}
			Asset: {value}
		</pre>
	</div>
</Stack>
