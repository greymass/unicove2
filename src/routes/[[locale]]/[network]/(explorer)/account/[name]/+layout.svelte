<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import dayjs from 'dayjs';
	import { Button } from '@wharfkit/svelte-components';

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;
	const { children, data } = $props();

	const options = $derived.by(() => {
		const account = String(data.account.name);
		let items = [
			{ href: urlPath(`/account/${account}`), text: 'Overview' },
			{ href: urlPath(`/account/${account}/activity`), text: 'Activity' },
			{ href: urlPath(`/account/${account}/balances`), text: 'Balances' }
		];

		items.push({
			href: urlPath(`/account/${account}/permissions`),
			text: 'Permissions'
		});
		items.push({ href: urlPath(`/account/${account}/votes`), text: 'Votes' });
		items.push({
			href: urlPath(`/account/${account}/proposals`),
			text: `Multisig (${data.account.proposals.length})`
		});
		items.push({ href: urlPath(`/account/${account}/authority`), text: 'Authority' });

		if (context.settings.data.developerMode) {
			items.push({ href: urlPath(`/account/${account}/data`), text: 'Data' });
		}

		if (context.settings.data.debugMode) {
			items.push({ href: urlPath(`/account/${account}/ram`), text: 'RAM' });
			items.push({
				href: urlPath(`/account/${account}/resources`),
				text: 'Resources'
			});
			items.push({ href: urlPath(`/account/${account}/staked`), text: 'Staked' });
			items.push({ href: urlPath(`/account/${account}/chaindata`), text: 'Data' });
		}

		return items;
	});

	let updated: ReturnType<typeof setInterval>;
	let lastUpdate = $state(0);
	let refresh: ReturnType<typeof setInterval>;
	onMount(() => {
		updated = setInterval(() => {
			const account = dayjs(data.account.last_update);
			const current = dayjs(new Date());
			lastUpdate = account.diff(current, 'seconds') * -1;
		}, 1000);
		refresh = setInterval(() => {
			data.account.refresh();
		}, 60000);
	});

	onDestroy(() => {
		clearInterval(updated);
		clearInterval(refresh);
	});
</script>

<Stack class="@container gap-6">
	<PillGroup {options} />
	{@render children?.()}
</Stack>

{#if context.settings.data.debugMode}
	<div class="text-muted text-center text-sm">
		props.account updated {lastUpdate} seconds ago
		<Button onclick={() => data.account.refresh()}>Refresh</Button>
	</div>
{/if}
