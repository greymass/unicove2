<script lang="ts">
	import Self from './permission.svelte';
	import Key from '$lib/components/elements/key.svelte';
	import { CopyButton } from '@wharfkit/svelte-components';
	import { IconButton } from '@wharfkit/svelte-components';
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import dayjs from 'dayjs';
	import { Clock, Edit, LogIn } from '@lucide/svelte';
	import { Name, PermissionLevel, UInt64 } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import type { TreePermission } from '$lib/types/permission';

	interface Props {
		account: Name;
		currentUser: boolean;
		loggedIn: boolean;
		msigMode: boolean;
		signin: (auth: PermissionLevel) => Promise<void>;
		permission: TreePermission;
		level?: number;
	}
	let { account, currentUser, loggedIn, msigMode, signin, level = 0, ...props }: Props = $props();
	let { permission, children } = $derived(props.permission);

	const context = getContext<UnicoveContext>('state');

	const anyPermissions = $derived(
		permission.required_auth.accounts.length ||
			permission.required_auth.keys.length ||
			permission.required_auth.waits.length
	);
	const isMSIG = $derived(permission.required_auth.threshold.gt(UInt64.from(1)));
	const isDeveloperMode = $derived(context.settings.data.developerMode);

	const editUrl = $derived(
		context.urlPath(`/account/${account}/permissions/${permission.perm_name}`)
	);
</script>

<li
	class="relative col-span-full grid grid-cols-subgrid"
	class:pl-4={level !== 0}
	class:pt-6={level !== 0}
>
	<dl
		class="bg-surface-container z-20 col-span-full space-y-1 rounded-t-lg px-4 py-3 md:col-span-1 md:rounded-l-lg md:rounded-r-none"
	>
		<div>
			<dt class="sr-only">Permission Name</dt>
			<dd class="text-on-surface text-xl font-semibold">
				<div class="flex items-center gap-2">
					{permission.perm_name}
					{#if loggedIn && (isDeveloperMode || (isMSIG && !msigMode))}
						<LogIn
							onclick={() =>
								signin(PermissionLevel.from({ actor: account, permission: permission.perm_name }))}
							class="text-muted hover:text-on-surface size-4"
						/>
					{/if}
				</div>
			</dd>
		</div>
		<div class="text-muted text-nowrap *:inline">
			<dt class="after:content-[':']">
				<span class="sr-only">Threshold</span>
				Required
			</dt>
			<dd>{permission.required_auth.threshold}</dd>
		</div>
		{#if permission.linked_actions}
			<div class="">
				<dt class="sr-only">Actions</dt>
				{#each permission.linked_actions as { action, account }}
					<dd>
						<Contract name={account} {action} class="flex">
							<span class="account">{account}</span>
							{#if action}
								<span class="action">::{action}</span>
							{/if}
						</Contract>
					</dd>
				{/each}
			</div>
		{/if}
	</dl>

	<div class="bg-surface rounded-b-lg px-4 py-3 md:rounded-l-none md:rounded-r-lg">
		{#if anyPermissions}
			<table class="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2">
				<thead class="col-span-full grid grid-cols-subgrid">
					<tr
						class="col-span-full grid grid-cols-subgrid text-left *:pt-1 *:text-base *:font-medium"
					>
						<th>Weight</th>
						<th>Authorization</th>
						<th class="flex items-center gap-2">
							{#if loggedIn && currentUser}
								<IconButton icon={Edit} href={editUrl}></IconButton>
							{/if}
						</th>
					</tr>
				</thead>
				<tbody class="col-span-full grid grid-cols-subgrid gap-x-4 gap-y-2">
					{#if permission.required_auth.keys}
						{#each permission.required_auth.keys as { weight, key }}
							<tr
								class="text-on-surface col-span-full grid grid-cols-subgrid items-start bg-none"
								data-hover-effect="false"
							>
								<td>
									+{weight.toString()}
								</td>
								<td>
									<Key {key} icon />
								</td>
								<td class="grid h-full items-center justify-items-end">
									<CopyButton data={key.toString()} />
								</td>
							</tr>
						{/each}
					{/if}
					{#if permission.required_auth.accounts}
						{#each permission.required_auth.accounts as { weight, permission: account }}
							<tr
								class="text-on-surface col-span-full grid grid-cols-subgrid bg-none"
								data-hover-effect="false"
							>
								<td>
									+{weight.toString()}
								</td>
								<td>
									<Account name={account.actor} icon>
										{account}
									</Account>
								</td>
								<td class="*:pt-1">
									<CopyButton data={account.toString()} />
								</td>
							</tr>
						{/each}
					{/if}
					{#if permission.required_auth.waits}
						{#each permission.required_auth.waits as { weight, wait_sec }}
							<tr
								class="text-on-surface col-span-full grid grid-cols-subgrid bg-none"
								data-hover-effect="false"
							>
								<td>
									+{weight.toString()}
								</td>
								<td class="text-on-surface flex items-center gap-2">
									<Clock class="size-4" />
									{wait_sec.toString()}s ({dayjs
										.duration(wait_sec.toNumber(), 'seconds')
										.humanize()})
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		{/if}
	</div>
	<!-- The curved connector line -->
	{#if level > 0}
		<div
			class="border-surface-container-highest absolute -left-[2px] z-10 size-12 rounded-bl-xl border-b-2 border-l-2"
		></div>
	{/if}
</li>

{#if children}
	<li class="col-span-full grid grid-cols-subgrid">
		<!-- The border on this ul is the through line -->
		<ul
			data-solo={children.length === 1}
			class="children data-[solo=false]:*:border-surface-container-highest col-span-full grid grid-cols-subgrid data-[solo=false]:*:border-l-2 data-[solo=false]:*:last:border-transparent"
			class:ml-8={level > 0}
			class:ml-4={level === 0}
		>
			<!-- style={`margin-left:calc(1rem * ${level + 1})`} -->
			{#each children as child}
				<Self
					{account}
					{currentUser}
					{loggedIn}
					{msigMode}
					{signin}
					permission={child}
					level={level + 1}
				/>
			{/each}
		</ul>
	</li>
{/if}
