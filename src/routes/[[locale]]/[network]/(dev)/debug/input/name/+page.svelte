<script lang="ts">
	import { Name } from '@wharfkit/antelope';

	import { NameInput } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import { Stack } from '@wharfkit/svelte-components';

	let input: NameInput;

	let value = $state(Name.from('greymass'));
	let valid = $state(false);
</script>

<Stack class="items-start">
	<span>
		<Button variant="secondary" onclick={() => input.set('greymass')}>Valid</Button>
		<Button variant="secondary" onclick={() => input.set('greymass.gm')}>Valid (Dot)</Button>
		<Button variant="secondary" onclick={() => input.set('Greymass')}>Invalid (Casing)</Button>
		<Button variant="secondary" onclick={() => input.set('greymassgreymass')}
			>Invalid (Length)</Button
		>
		<Button variant="secondary" onclick={() => input.set('123456')}>Invalid (Number >5)</Button>
		<Button variant="secondary" onclick={() => input.set('big$')}>Invalid (Symbol)</Button>
	</span>

	<Button disabled={!valid} onclick={() => alert(value)}>Do a thing with the name!</Button>

	<div>
		<label>
			Enter a valid name:
			<NameInput bind:this={input} autofocus bind:value bind:valid debug />
		</label>
	</div>

	<div>
		<h3>Page State</h3>
		<pre>
			Valid Input: {valid}
			Name: {value}
		</pre>
	</div>
</Stack>
