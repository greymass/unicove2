<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import SuspiciousMemo from '$lib/components/elements/suspiciousmemo.svelte';
	import { ArrowBigRight, NotebookText } from '@lucide/svelte';
	import { Chip } from '@wharfkit/svelte-components';
	import type { Snippet } from 'svelte';
	import Row from './row.svelte';

	interface Props {
		from: NameType;
		to: NameType;
		quantity: AssetType;
		children?: Snippet;
		memo?: string;
		perspectiveOf?: Name;
	}

	const { from, to, quantity, memo, perspectiveOf, ...props }: Props = $props();

	const isSend = $derived(perspectiveOf && perspectiveOf.equals(from));
	const isReceive = $derived(perspectiveOf && perspectiveOf.equals(to));
</script>

<Row>
	<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
		{#if isSend}
			<Chip class="bg-error-container text-on-error-container">Sent</Chip>
		{:else if isReceive}
			<Chip class="bg-success-container text-on-success-container">Received</Chip>
		{:else}
			<Chip class="">Transfer</Chip>
		{/if}

		<AssetElement class="font-medium" value={Asset.from(quantity)} variant="full" />

		<span class="inline-flex items-center gap-1.5">
			<AccountLink name={Name.from(from)} />
			<ArrowBigRight class="text-on-surface-variant size-4 shrink-0" />
			<AccountLink name={Name.from(to)} />
		</span>

		{#if memo}
			<span class="text-on-surface-variant inline-flex items-start gap-1">
				<NotebookText class="mt-0.5 size-3.5 shrink-0" />
				<SuspiciousMemo {memo} />
			</span>
		{/if}

		{#if props.children}
			{@render props.children()}
		{/if}
	</span>
</Row>
