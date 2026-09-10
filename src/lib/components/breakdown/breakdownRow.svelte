<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { cn } from '$lib/utils';
	import { Button } from '@wharfkit/svelte-components';

	type BreakdownAction = {
		href: string;
		text: string;
		visible?: boolean;
	};

	interface Props {
		key: string;
		value: Asset | undefined;
		action?: BreakdownAction;
	}

	let { key, value, action }: Props = $props();

	const isTotal = key === 'Total';
</script>

<div
	class={cn(
		'border-outline col-span-full grid min-h-12 grid-cols-subgrid items-center gap-x-4 border-b last:border-none ',
		isTotal && 'font-semibold'
	)}
>
	<div
		class="col-start-1 col-end-3 row-start-1 flex flex-col py-2 @xs:flex-row @xs:justify-between"
	>
		<div class="text-muted">{key}</div>
		<div class="text-on-surface">
			<AssetText class="text-nowrap tabular-nums" variant="full" {value} />
		</div>
	</div>

	{#if action && action.visible}
		<div class="col-span-2 col-start-2 row-start-1 text-right @xs:col-span-1 @xs:col-start-3">
			<Button variant="text" class="justify-end" href={action.href}>
				{action.text}
			</Button>
		</div>
	{/if}
</div>
