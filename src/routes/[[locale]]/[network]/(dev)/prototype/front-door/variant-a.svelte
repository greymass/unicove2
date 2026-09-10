<script lang="ts">
	import { onMount } from 'svelte';
	import { SPECIMEN_NAME, type Copy } from './copy';

	interface Props {
		copy: Copy;
		allOpen: boolean;
		phase: 'idle' | 'creating' | 'failed';
		walletsHref: string;
		oncreate: () => void;
	}

	let { copy, allOpen, phase, walletsHref, oncreate }: Props = $props();

	const GLYPHS = 'abcdefghijklmnopqrstuvwxyz12345';

	let settled = $state(false);
	let scramble = $state(SPECIMEN_NAME.split(''));
	let opened = $state<number | null>(null);

	const reduced =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	onMount(() => {
		if (reduced) {
			settled = true;
			return;
		}
		const target = SPECIMEN_NAME.split('');
		let locked = 0;
		const tick = setInterval(() => {
			locked += 1;
			scramble = target.map((char, i) =>
				i < locked ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
			);
			if (locked >= target.length) {
				clearInterval(tick);
				settled = true;
			}
		}, 45);
		return () => clearInterval(tick);
	});

	function toggle(index: number) {
		opened = opened === index ? null : index;
	}

	function isOpen(index: number) {
		return allOpen || opened === index;
	}
</script>

<section
	style="--field: oklch(from var(--theme-seed) 0.42 c h); --ink: oklch(from var(--theme-seed) 0.98 0.02 h); background: var(--field); color: var(--ink);"
	class="@container relative grid min-h-full content-between gap-[clamp(1.75rem,3.5cqw,3rem)] overflow-hidden px-[clamp(1.25rem,5cqw,4rem)] py-[clamp(2rem,5cqw,3.5rem)]"
>
	<div class="grid gap-[clamp(1rem,2cqw,1.75rem)]">
		<h1
			class="max-w-[18ch] text-[clamp(1.5rem,3.2cqw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
		>
			{copy.heading}
		</h1>

		<div class="grid gap-3">
			<p
				aria-hidden="true"
				data-settled={settled}
				class="font-mono text-[clamp(2rem,11.5cqw,7rem)] leading-[0.9] font-bold tracking-[-0.055em] text-current/45 transition-[color,opacity] duration-700 ease-out data-[settled=true]:text-current"
			>
				{#each scramble as char, i (i)}<span
						class="inline-block transition-transform duration-500 ease-out"
						style:transition-delay="{i * 25}ms"
						style:transform={settled ? 'none' : 'translateY(0.04em)'}>{char}</span
					>{/each}
			</p>
			<p class="max-w-[46ch] text-[clamp(0.95rem,1.5cqw,1.15rem)] text-pretty text-current/70">
				{copy.specimenCaption}
			</p>
		</div>
	</div>

	<div class="grid gap-5">
		<p
			class="max-w-[52ch] text-[clamp(1rem,1.9cqw,1.375rem)] leading-snug text-pretty text-current/85"
		>
			{copy.reassurance}
		</p>

		<div class="flex flex-wrap items-center gap-x-8 gap-y-4">
			<button
				type="button"
				onclick={oncreate}
				disabled={phase === 'creating'}
				class="focus-visible:outline-solar-500 h-14 rounded-none bg-[var(--ink)] px-9 text-[clamp(1rem,1.6cqw,1.15rem)] font-semibold tracking-[-0.01em] text-[var(--field)] transition-[transform,opacity] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 active:translate-y-0 disabled:opacity-60"
			>
				{phase === 'creating' ? copy.creating : copy.create}
			</button>
			<a
				href={walletsHref}
				class="text-current/75 underline decoration-current/40 underline-offset-[6px] transition-colors hover:text-current"
			>
				{copy.ownWallet}
			</a>
		</div>

		{#if phase === 'failed'}
			<p role="alert" class="max-w-[52ch] pt-1 text-sm text-current">
				{copy.failure}
			</p>
		{/if}
	</div>

	<dl class="grid grid-cols-2 border-t border-current/25 @2xl:grid-cols-4">
		{#each copy.disclosures as row, i (row.label)}
			<div
				class="border-b border-l border-current/25 first:border-l-0 @2xl:border-b-0 @2xl:[&:nth-child(3)]:border-l"
			>
				<button
					type="button"
					aria-expanded={isOpen(i)}
					onclick={() => toggle(i)}
					class="focus-visible:outline-solar-500 group grid h-full w-full gap-1.5 px-[clamp(0.75rem,1.5cqw,1.25rem)] py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2"
				>
					<dt class="text-[0.7rem] font-medium tracking-[0.14em] text-current/60 uppercase">
						{row.label}
					</dt>
					<dd class="text-[clamp(0.95rem,1.5cqw,1.2rem)] font-medium text-balance">
						{row.answer}
					</dd>
				</button>
			</div>
		{/each}

		{#each copy.disclosures as row, i (row.label)}
			<div
				class="col-span-full grid transition-[grid-template-rows] duration-300 ease-out"
				style:grid-template-rows={isOpen(i) ? '1fr' : '0fr'}
			>
				<div class="overflow-hidden">
					<p
						class="max-w-[62ch] border-t border-current/25 px-[clamp(0.75rem,1.5cqw,1.25rem)] py-4 text-pretty text-current/85"
					>
						{row.detail}
					</p>
				</div>
			</div>
		{/each}
	</dl>
</section>
