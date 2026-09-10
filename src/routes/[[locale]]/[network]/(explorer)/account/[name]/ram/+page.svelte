<script lang="ts">
	import { Asset, type Int64 } from '@wharfkit/antelope';
	import { Card, DD, DL, DLRow } from '@wharfkit/svelte-components';
	import { Ram as RAM } from '@wharfkit/svelte-components';
	import { calculateValue } from '$lib/utils';

	const { data } = $props();

	const ram = $derived(data.account.resources.ram);
	const price = $derived(data.network.resources.ram.price.rammarket);

	function tokenValue(bytes: Int64) {
		return calculateValue(Asset.fromUnits(bytes, '3,RAM'), price);
	}
</script>

{#if data.account}
	<h3>Account RAM</h3>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<Card title="Network Resource">
			<DL>
				<DLRow title="Total">
					<DD><RAM bytes={Number(ram.max || 0)} /></DD>
				</DLRow>
				<DLRow title="Used">
					<DD><RAM bytes={Number(ram.used || 0)} /></DD>
				</DLRow>
				<DLRow title="Available to use">
					<DD><RAM bytes={Number(ram.available || 0)} /></DD>
				</DLRow>
			</DL>
		</Card>
		<Card title="RAM Holdings">
			<DL>
				<DLRow title="Owned">
					<DD>
						<RAM bytes={Number(ram.owned || 0)} />
						{#if price}
							({tokenValue(ram.owned)})
						{/if}
					</DD>
				</DLRow>
				<DLRow title="Tradable">
					<DD>
						<RAM bytes={Number(ram.balance || 0)} />
						{#if price}
							({tokenValue(ram.balance)})
						{/if}
					</DD>
				</DLRow>
				{#if Number(ram.gifted)}
					<DLRow title="Gifted (untransferable)">
						<DD><RAM bytes={Number(ram.gifted || 0)} /></DD>
					</DLRow>
				{/if}
			</DL>
		</Card>
	</div>
{:else}
	<p>Loading account RAM details...</p>
{/if}

{#if data.network}
	<Card>
		<h3 class="mb-2 text-xl font-semibold">Current RAM Prices</h3>
		<ul class="space-y-2">
			<li>
				{data.network.resources.ram.price.rammarket.quantity}
				{data.account.network.chain.systemToken?.symbol.code || ''}/KB
			</li>
		</ul>
	</Card>
{/if}
