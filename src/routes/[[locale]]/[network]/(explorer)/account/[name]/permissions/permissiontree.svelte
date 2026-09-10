<script lang="ts">
	import type { Name, PermissionLevel } from '@wharfkit/session';
	import Permission from './permission.svelte';
	import type { TreePermission } from '$lib/types/permission';

	interface Props {
		account: Name;
		currentUser: boolean;
		loggedIn: boolean;
		msigMode: boolean;
		signin: (auth: PermissionLevel) => Promise<void>;
		permissions: TreePermission[];
	}
	let props: Props = $props();
</script>

<ul class="grid grid-cols-[auto_1fr] overflow-x-auto">
	{#each props.permissions as permission}
		<Permission
			account={props.account}
			currentUser={props.currentUser}
			loggedIn={props.loggedIn}
			msigMode={props.msigMode}
			signin={props.signin}
			{permission}
		/>
	{/each}
</ul>
