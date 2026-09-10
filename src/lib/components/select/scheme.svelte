<script lang="ts">
	import { Switch } from '@wharfkit/svelte-components';
	import type { CreateSwitchProps } from '@melt-ui/svelte';
	import { browser } from '$app/environment';

	let darkMode = $state(browser && localStorage.getItem('color-scheme') === 'dark');

	const onDarkModeToggle: CreateSwitchProps['onCheckedChange'] = ({ next }) => {
		const scheme = next ? 'dark' : 'light';
		localStorage.setItem('color-scheme', scheme);
		document.documentElement.setAttribute('data-scheme', scheme);
		document.documentElement.style.setProperty('color-scheme', scheme);
		return next;
	};
</script>

<Switch id="color-scheme" onCheckedChange={onDarkModeToggle} bind:checked={darkMode} />
