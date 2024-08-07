<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import TextInput from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Switch from '$lib/components/input/switch.svelte';
	import Checkbox from '$lib/components/input/checkbox.svelte';

	import { Asset } from '@wharfkit/antelope';
	import AssetInput from '$lib/components/input/asset.svelte';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);

	let controlledSwitch = $state(false);
	let controlledBox = $state(false);

	$effect(() => {
		let id = setInterval(() => {
			controlledSwitch = !controlledSwitch;
			controlledBox = !controlledBox;
		}, 1000);
		return () => clearInterval(id);
	});
</script>

<Stack id="inputs">
	<Stack>
		<h2 class="h2">Text Input</h2>
		<div>
			<h3 class="h3">Default</h3>
			<TextInput placeholder="Placeholder text" />
		</div>
		<div>
			<h3 class="h3">With Label</h3>
			<fieldset class="grid gap-3">
				<Label for="labeled-input">Enter a value</Label>
				<TextInput id="labeled-input" placeholder="Placeholder text" value="" />
			</fieldset>
		</div>
	</Stack>

	<div>
		<h2 class="h2">Asset Input</h2>
		<Label for="assetInput">Enter token value:</Label>
		<AssetInput id="assetInput" bind:this={input} bind:value bind:valid bind:min bind:max />
	</div>
	<form>
		<div>
			<h2 class="h2">Switch</h2>
			<Label for="mySwitch-1">Default:</Label>
			<Switch id="mySwitch-1" name="mySwitch-1" isDisabled={false} isChecked={false} />
			<Label for="mySwitch-2">Disabled:</Label>
			<Switch id="mySwitch-2" name="mySwitch-2" isDisabled={true} isChecked={true} />
			<Label for="mySwitch-3">Checked:</Label>
			<Switch id="mySwitch-3" name="mySwitch-3" isDisabled={false} bind:isChecked={controlledSwitch} />

			<p>Switch is {controlledSwitch ? 'on' : 'off'}</p>
		</div>
		<div class="mt-5">
			<h2 class="h2">Checkbox</h2>
			<Label for="myCheckbox-1">Default:</Label>
			<Checkbox id="myCheckbox-1" name="myCheckbox-1" isDisabled={false} isChecked={false} />
			<Label for="myCheckbox-2">Disabled:</Label>
			<Checkbox id="myCheckbox-2" name="myCheckbox-2" isDisabled={true} isChecked={true} />
			<Label for="myCheckbox-3">Checked:</Label>
			<Checkbox id="myCheckbox-3" name="myCheckbox-3" isDisabled={false} bind:isChecked={controlledSwitch} />

			<p>Checkbox is {controlledSwitch ? 'checked' : 'empty'}</p>
		</div>
	</form>
</Stack>
