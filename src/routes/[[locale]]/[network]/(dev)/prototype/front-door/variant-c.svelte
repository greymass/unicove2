<script lang="ts">
	import type { Copy } from './copy';

	interface Props {
		copy: Copy;
		allOpen: boolean;
		phase: 'idle' | 'creating' | 'failed';
		walletsHref: string;
		oncreate: () => void;
	}

	let { copy, allOpen, phase, walletsHref, oncreate }: Props = $props();

	let opened = $state<number[]>([]);

	function toggle(index: number) {
		opened = opened.includes(index) ? opened.filter((i) => i !== index) : [...opened, index];
	}

	function isOpen(index: number) {
		return allOpen || opened.includes(index);
	}

	let visible = $derived(
		copy.disclosures.map((row, i) => ({ row, i })).filter(({ i }) => isOpen(i))
	);
</script>

<section
	style="--field: oklch(from var(--color-primary) 0.21 0.075 h); --ink: oklch(from var(--color-primary) 0.97 0.02 h); background: var(--field); color: var(--ink);"
	class="@container grid min-h-full content-center gap-[clamp(2rem,5cqw,3.5rem)] px-[clamp(1.25rem,6cqw,6rem)] py-[clamp(2.5rem,7cqw,5rem)]"
>
	<h1
		class="max-w-[21ch] text-[clamp(2rem,5.6cqw,4rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-pretty"
	>
		<span>{copy.sentenceLead}</span>{#each copy.disclosures as row, i (row.label)}<button
				type="button"
				aria-expanded={isOpen(i)}
				onclick={() => toggle(i)}
				data-open={isOpen(i)}
				class="focus-visible:outline-solar-500 inline cursor-pointer rounded-sm text-left underline decoration-dotted decoration-[0.06em] underline-offset-[0.14em] transition-[color,text-decoration-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4"
				style="color: var(--ink); text-decoration-color: color-mix(in oklch, var(--ink) 40%, transparent);"
				>{row.clause}{i < copy.disclosures.length - 1
					? copy.clauseSeparator
					: copy.sentenceTail}</button
			>{/each}
	</h1>

	<div class="grid gap-0 transition-[grid-template-rows] duration-300 ease-out" aria-live="polite">
		{#each visible as { row, i } (i)}
			<p
				class="max-w-[68ch] border-t py-4 text-[clamp(0.95rem,1.5cqw,1.15rem)] text-pretty"
				style="color: color-mix(in oklch, var(--ink) 75%, transparent); border-color: color-mix(in oklch, var(--ink) 22%, transparent);"
			>
				{row.detail}
			</p>
		{/each}
	</div>

	<div class="flex flex-wrap items-center gap-x-8 gap-y-4">
		<button
			type="button"
			onclick={oncreate}
			disabled={phase === 'creating'}
			style="background: var(--ink); color: var(--field);"
			class="focus-visible:outline-solar-500 h-14 rounded-full px-10 text-[1.05rem] font-semibold transition-[transform,opacity] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60"
		>
			{phase === 'creating' ? copy.creating : copy.create}
		</button>
		<a
			href={walletsHref}
			style="color: color-mix(in oklch, var(--ink) 70%, transparent);"
			class="underline underline-offset-[6px] transition-opacity hover:opacity-100"
		>
			{copy.ownWallet}
		</a>
	</div>

	{#if phase === 'failed'}
		<p role="alert" style="color: var(--ink);" class="max-w-[52ch] text-sm opacity-90">
			{copy.failure}
		</p>
	{/if}
</section>
