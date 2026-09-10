<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Button, Stack } from '@wharfkit/svelte-components';
	import { page } from '$app/state';

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	interface ProposalsHeaderProps {
		accountName: string;
		children: Snippet;
	}

	const { accountName, ...props }: ProposalsHeaderProps = $props();

	const options = $derived.by(() => [
		{ href: urlPath(`/account/${accountName}/proposals`), text: 'Created' },
		{ href: urlPath(`/account/${accountName}/proposals/approvals`), text: 'Approvals' },
		{ href: urlPath(`/account/${accountName}/proposals/timeline`), text: 'Timeline' }
	]);

	let currentOption = $derived(
		options.map((o) => o.href).findLast((h) => page.url.pathname.startsWith(h))
	);

	const isCurrent = (href: string) => currentOption === href;
</script>

<!-- gap-8 for better vertical spacing with hr and page menu -->
<Stack class="gap-8">
	<hr class="text-outline hidden lg:block" />
	<div class="flex flex-wrap items-end justify-between gap-6">
		<div class="grid gap-4">
			<h2 class="text-title col-span-full">Multisig Proposals</h2>

			<menu aria-label="msig pages" class="flex gap-2 overflow-auto">
				{#each options as option}
					<li>
						<Button
							variant="pill"
							aria-current={isCurrent(option.href) ? 'page' : undefined}
							href={option.href}
						>
							{option.text}
						</Button>
					</li>
				{/each}
			</menu>
		</div>
		<div class="flex lg:justify-end">
			{@render props.children()}
		</div>
	</div>
</Stack>
