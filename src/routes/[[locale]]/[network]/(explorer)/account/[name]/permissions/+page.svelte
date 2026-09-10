<script lang="ts">
	import { Name, PermissionLevel } from '@wharfkit/antelope';
	import PermissionTree from './permissiontree.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { generateRandomName } from '$lib/utils/random';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type { TreePermission } from '$lib/types/permission';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	function buildTree(data: TreePermission[], parentId = Name.from('')): TreePermission[] {
		const tree: TreePermission[] = [];
		data.forEach((item) => {
			// Check if the item belongs to the current parent
			if (item.permission.parent.equals(parentId)) {
				// Recursively build the children of the current item
				const children = buildTree(data, item.permission.perm_name);
				// If children exist, assign them to the current item
				if (children.length) {
					item.children = children;
				}
				// Add the current item to the tree
				tree.push(item);
			}
		});
		return tree;
	}

	const treePermissions = $derived(data.account.permissions.map((p) => ({ permission: p })));
	const permissions = $derived(buildTree(treePermissions));

	const currentUser = $derived(
		!!(context.wharf.session && data.account.name.equals(context.wharf.session?.actor))
	);

	const loggedIn = $derived(!!context.wharf.session);
	const msigMode = $derived(context.wharf.session?.walletPlugin.id === 'wallet-plugin-multisig');

	async function signin(auth: PermissionLevel) {
		await context.wharf.multisig(auth);
		goto(`/${data.account.network}/account/${auth.actor}`);
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h2 class="text-title leading-tight">Keys and Permissions</h2>

	{#if currentUser}
		<Button
			href={context.urlPath(`/account/${data.account.name}/permissions/${generateRandomName()}`)}
			class="flex-none"
		>
			New Permission
		</Button>
	{/if}
</div>

<PermissionTree
	account={data.account.name}
	{currentUser}
	{loggedIn}
	{msigMode}
	{signin}
	{permissions}
/>
