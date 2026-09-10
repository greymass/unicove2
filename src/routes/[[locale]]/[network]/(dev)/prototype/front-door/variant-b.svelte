<script lang="ts">
	import { SPECIMEN_NAME, type Copy } from './copy';

	interface Props {
		copy: Copy;
		allOpen: boolean;
		phase: 'idle' | 'creating' | 'failed';
		walletsHref: string;
		oncreate: () => void;
	}

	let { copy, allOpen, phase, walletsHref, oncreate }: Props = $props();

	let previewing = $state(false);
	let opened = $state<number | null>(null);

	let claimed = $derived(previewing || phase === 'creating');

	function toggle(index: number) {
		opened = opened === index ? null : index;
	}

	function isOpen(index: number) {
		return allOpen || opened === index;
	}
</script>

<section
	class="bg-surface @container grid min-h-full content-center gap-[clamp(2.5rem,6cqw,5rem)] px-[clamp(1.25rem,5cqw,4.5rem)] py-[clamp(2.5rem,6cqw,4.5rem)] @3xl:grid-cols-[1fr_minmax(0,26rem)] @3xl:items-center"
>
	<div class="grid max-w-[34rem] gap-6">
		<h1
			class="text-on-surface text-[clamp(2rem,5.2cqw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
		>
			{copy.heading}
		</h1>

		<p class="text-muted max-w-[46ch] text-[clamp(1rem,1.6cqw,1.25rem)] leading-snug text-pretty">
			{copy.reassurance}
		</p>

		<div class="mt-1 grid justify-items-start gap-4">
			<button
				type="button"
				onclick={oncreate}
				onpointerenter={() => (previewing = true)}
				onpointerleave={() => (previewing = false)}
				onfocus={() => (previewing = true)}
				onblur={() => (previewing = false)}
				disabled={phase === 'creating'}
				class="bg-primary text-on-primary focus-visible:outline-solar-500 h-14 rounded-xl px-8 text-[1.05rem] font-semibold shadow-[0_1px_0_0_oklch(1_0_0/0.25)_inset] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60"
			>
				{phase === 'creating' ? copy.creating : copy.create}
			</button>

			<a
				href={walletsHref}
				class="text-muted hover:text-on-surface decoration-outline underline underline-offset-4 transition-colors"
			>
				{copy.ownWallet}
			</a>

			{#if phase === 'failed'}
				<p role="alert" class="text-error max-w-[44ch] text-sm">{copy.failure}</p>
			{/if}
		</div>

		<dl class="border-outline mt-2 grid border-t">
			{#each copy.disclosures as row, i (row.label)}
				<div class="border-outline border-b">
					<button
						type="button"
						aria-expanded={isOpen(i)}
						onclick={() => toggle(i)}
						class="focus-visible:outline-solar-500 flex w-full items-baseline justify-between gap-4 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2"
					>
						<dt class="text-muted text-[0.68rem] font-medium tracking-[0.16em] uppercase">
							{row.label}
						</dt>
						<dd class="text-on-surface text-right text-sm font-medium">{row.answer}</dd>
					</button>
					<div
						class="grid transition-[grid-template-rows] duration-300 ease-out"
						style:grid-template-rows={isOpen(i) ? '1fr' : '0fr'}
					>
						<div class="overflow-hidden">
							<p class="max-w-[56ch] pb-4 text-sm text-pretty">{row.detail}</p>
						</div>
					</div>
				</div>
			{/each}
		</dl>
	</div>

	<div class="grid place-items-center @3xl:pl-8">
		<div
			data-claimed={claimed}
			style="--field: oklch(from var(--theme-seed) 0.38 c h); --ink: oklch(from var(--theme-seed) 0.98 0.02 h); background: var(--field); color: var(--ink);"
			class="grid aspect-[1.586] w-full max-w-[26rem] [transform:rotate(-2.5deg)] content-between rounded-2xl p-[clamp(1.25rem,2.5cqw,1.75rem)] shadow-[0_30px_60px_-30px_oklch(0_0_0/0.45)] transition-transform duration-500 ease-out data-[claimed=true]:[transform:rotate(0deg)_translateY(-6px)]"
		>
			<div class="flex items-start justify-between">
				<span class="font-mono text-xs tracking-[0.22em] uppercase opacity-70">
					{copy.cardIssuer}
				</span>
				<span class="size-6 rounded-full border-2 border-current/50"></span>
			</div>

			<div class="grid gap-2">
				<span
					data-claimed={claimed}
					class="border-b border-dashed border-current/35 pb-2 font-mono text-[clamp(1.1rem,3cqw,1.6rem)] tracking-[-0.02em] opacity-55 transition-opacity duration-300 data-[claimed=true]:border-solid data-[claimed=true]:opacity-100"
				>
					{claimed ? SPECIMEN_NAME : copy.cardNameField}
				</span>
			</div>

			<div
				class="flex items-end justify-between font-mono text-[0.7rem] tracking-[0.14em] uppercase opacity-70"
			>
				<span>{copy.cardCreatedField}</span>
				<span>{claimed ? 'now' : '--  /  --'}</span>
			</div>
		</div>
	</div>
</section>
