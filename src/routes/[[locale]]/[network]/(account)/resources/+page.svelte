<script lang="ts">
	import { Int64 } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { CpuIcon, WifiIcon, HardDrive } from '@lucide/svelte';

	import { Stack } from '@wharfkit/svelte-components';
	import { Button } from '@wharfkit/svelte-components';
	import CpuAndNetResource from '$lib/components/elements/cpunetresource.svelte';
	import RamResource from '$lib/components/elements/ramresource.svelte';
	import AccountBalance from '$lib/components/card/accountbalance.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { SingleCard } from '$lib/components/layout/index.js';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const cpuAvailableSize = $derived(context.account?.resources.cpu.available || Int64.from(0));
	const netAvailableSize = $derived(context.account?.resources.net.available || Int64.from(0));
	const ramAvailableSize = $derived(context.account?.resources.ram.available || Int64.from(0));

	const chainName = data.network.chain.name;
	const symbolName = data.network.chain.systemToken?.symbol.name || 'token';

	const explanations = [
		{
			icon: CpuIcon,
			name: 'CPU',
			title: 'CPU (Central Processing Unit)',
			descriptions: [
				'Provides processing power for blockchain actions.',
				'Measured in microseconds.',
				'Needed to execute transactions.'
			]
		},
		{
			icon: WifiIcon,
			name: 'NET',
			title: 'NET (Network Bandwidth)',
			descriptions: [
				'Represents network bandwidth usage.',
				'Required for transactions on the blockchain.'
			]
		},
		{
			icon: undefined,
			name: 'CPU and NET',
			title: 'CPU and NET',
			descriptions: [
				`Can be "powered up" by spending ${symbolName}.`,
				'Some free services offer daily power-ups.',
				`Amount received is proportional to ${symbolName} spent.`,
				'Lasts for a specific time period.'
			]
		},
		{
			icon: HardDrive,
			name: 'RAM',
			title: 'RAM (Random Access Memory)',
			descriptions: [
				"It's like computer memory, but for the blockchain.",
				'Used to store data on the blockchain.',
				'Limited and in high demand.',
				'Can be bought and sold by users.',
				'Price changes based on availability.'
			]
		}
	];
</script>

<SingleCard class="">
	<Stack>
		{#if cpuAvailableSize && netAvailableSize}
			<CpuAndNetResource cpuAvailable={cpuAvailableSize} netAvailable={netAvailableSize} />
		{/if}
		{#if data.network.supports('powerup')}
			<Button variant="primary" href={context.urlPath('/resources/powerup')}
				>Rent resources with PowerUp</Button
			>
		{/if}
		{#if data.network.supports('rentrex')}
			<Button variant="primary" href={context.urlPath('/resources/rex')}
				>Rent resources with REX</Button
			>
		{/if}
		{#if data.network.supports('stakeresource')}
			<Button variant="primary" href={context.urlPath('/resources/stake')}
				>Stake {symbolName} for resources</Button
			>
		{/if}

		<RamResource ramAvailable={ramAvailableSize} />
		<Button variant="secondary" href={context.urlPath('/ram')}>RAM Market</Button>

		<AccountBalance class="bg-surface-container-high" />
	</Stack>
	<Stack class="hidden max-w-lg flex-1 gap-4">
		<Stack class="gap-4 px-5 py-3">
			<h3 class="text-title">{chainName} Resources: A Simple Explanation</h3>
			<p>
				The {chainName} blockchain uses three main resources: CPU, NET, and RAM. Users need these resources
				to interact with smart contracts and perform actions on the {chainName} blockchain. Managing
				these resources is crucial for efficient use of the
				{chainName} network.
			</p>
		</Stack>
		<ul class="space-y-4 xl:space-y-0">
			{#each explanations as explanation}
				<li class="grid grid-cols-1 gap-y-4 sm:grid-cols-[25%_75%]">
					<div class="flex justify-center sm:pt-5 sm:pl-5">
						{#if explanation.icon}
							{@const Component = explanation.icon}
							<Component class="text-on-surface size-5" />
						{/if}
					</div>
					<div class="space-y-4 px-5 py-3">
						<h3 class="text-title text-on-surface">{explanation.title}</h3>
						<ul class="space-y-1">
							{#each explanation.descriptions as desc}
								<li>- {desc}</li>
							{/each}
						</ul>
					</div>
				</li>
			{/each}
		</ul>
	</Stack>
</SingleCard>
