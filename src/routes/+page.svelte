<script>
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/button/button.svelte';
	import { Box, Center, Stack } from '$lib/components/layout';
	import { languageTag } from '$lib/paraglide/runtime';

	const { data } = $props();
	const { wharf } = $derived(data);
</script>

<Box>
	<Center>
		<Stack>
			<p>Language: {languageTag()}</p>

			<p>Test Localization String: {m.test_locale_string()}</p>

			<Button href="/debug/input/asset">Asset Input</Button>
			<Button href="/debug/state/network">Network State</Button>
			<Button href="/debug/components">Component Library</Button>

			<h3>{m.active_session()}</h3>
			{#if wharf}
				{#if wharf.session}
					<p>Current: {wharf.session.actor}</p>
					<Button onclick={() => wharf.logout(wharf.session)}>Logout current account</Button>
					<Button onclick={() => wharf.logout()}>Logout all accounts</Button>
				{/if}

				<h3>Sessions</h3>
				<Button onclick={() => wharf.login()}>Login</Button>
				{#each wharf.sessions as session}
					<p>
						<Button onclick={() => wharf.switch(session)} variant="secondary">
							Switch: {session.actor}@{session.permission} ({session.chain})
						</Button>
					</p>
				{/each}
			{/if}
		</Stack>
	</Center>
</Box>
