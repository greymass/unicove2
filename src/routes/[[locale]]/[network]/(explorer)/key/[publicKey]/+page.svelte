<script lang="ts">
	import { Card, Stack } from '@wharfkit/svelte-components';
	import Account from '$lib/components/elements/account.svelte';
	import Key from '@lucide/svelte/icons/key-round';
	import { CopyButton } from '@wharfkit/svelte-components';

	let { data } = $props();

	const pubKey = $derived(String(data.publicKey));
	const legacyPubKey = $derived.by(() => {
		try {
			return data.publicKey.toLegacyString();
		} catch (error) {
			console.log(error);
			return undefined;
		}
	});
</script>

<Stack>
	<Card>
		<div class="flex gap-6">
			<picture
				class="bg-surface-container-high grid size-12 shrink-0 place-items-center rounded-full"
			>
				<Key />
			</picture>
			<div class="grid gap-0.5 text-balance *:break-all">
				<div class="flex items-center gap-1">
					<p class="text-on-surface font-semibold break-all">
						{pubKey}
					</p>
					<CopyButton data={pubKey} />
				</div>
				{#if legacyPubKey}
					<p class="text-muted">Legacy Key: {legacyPubKey}</p>
				{/if}
			</div>
		</div>
	</Card>
	<Card title="Associated Accounts">
		{#if data.accounts && data.accounts.length > 0}
			<ul class="layout-grid" style="--grid-itemWidth:20ch;">
				{#each data.accounts as account}
					<li class="flex">
						<Account
							name={account}
							class="hover:bg-surface-container-high hover:text-on-surface h-12 content-center rounded-lg px-4"
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-muted">No accounts found</p>
		{/if}
	</Card>
</Stack>
