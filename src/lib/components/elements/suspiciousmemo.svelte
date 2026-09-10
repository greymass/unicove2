<script module lang="ts">
	let pageRevealed = $state(false);
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { AlertTriangle, EyeOff } from '@lucide/svelte';
	import { Button } from '@wharfkit/svelte-components';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { isSuspiciousMemo } from '$lib/utils/memo';

	interface Props {
		memo: string;
	}

	const { memo }: Props = $props();

	const context = getContext<UnicoveContext>('state');

	const warnEnabled = $derived(context.settings.data.warnSuspiciousMemos !== false);
	const isSuspicious = $derived(isSuspiciousMemo(memo));
	const shouldHide = $derived(warnEnabled && isSuspicious);

	beforeNavigate(() => {
		pageRevealed = false;
	});

	const {
		elements: { trigger, overlay, content, close, portalled },
		states: { open }
	} = createDialog({
		preventScroll: true
	});

	function handleReveal() {
		pageRevealed = true;
		$open = false;
	}
</script>

{#if !shouldHide || pageRevealed}
	<span class="break-all">{memo}</span>
{:else}
	<span class="inline-flex items-center gap-1.5">
		<button
			use:melt={$trigger}
			class="text-on-surface-variant/60 hover:text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs transition-colors"
		>
			<EyeOff class="size-3" />
			<span>Memo hidden - click to reveal</span>
		</button>
	</span>
{/if}

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="bg-scrim/80 fixed inset-0 z-50"
			transition:fade={{ duration: 150 }}
		></div>

		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				use:melt={$content}
				class="bg-surface-container w-full max-w-md rounded-xl p-6 shadow-xl"
				transition:fade={{ duration: 150 }}
			>
				<div class="mb-4 flex items-start gap-3">
					<div class="bg-warning-container text-on-warning-container rounded-full p-2">
						<AlertTriangle class="size-6" />
					</div>
					<div>
						<h2 class="text-on-surface text-lg font-semibold">Potential Safety Warning</h2>
						<p class="text-on-surface-variant mt-1 text-sm">
							This memo contains content that may pose a security risk.
						</p>
					</div>
				</div>

				<div class="bg-surface-container-high text-on-surface-variant mb-6 rounded-lg p-4 text-sm">
					<p class="mb-3">
						Scammers often send small transactions with phishing links to steal your funds.
					</p>
					<p class="font-medium">
						<strong class="text-error">Never</strong> enter private keys, seed phrases, or credentials
						on websites linked from transaction memos.
					</p>
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="secondary" meltAction={close}>Cancel</Button>
					<Button variant="primary" onclick={handleReveal}>Reveal Memo</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
