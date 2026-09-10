<script lang="ts">
	import { fly } from 'svelte/transition';
	import { melt, type Toast } from '@melt-ui/svelte';
	import { page } from '$app/state';

	import type { elements as toastElements, ToastData } from '$lib/state/toaster.svelte';
	import { localizePath, resolveLocale } from '$lib/utils/url';

	interface Props {
		elements: typeof toastElements;
		toast: Toast<ToastData>;
	}

	let { elements, toast }: Props = $props();
	let { description, content, title, close } = $derived(elements);
	let { id, data } = $derived(toast);
	const transactionsHref = $derived(
		localizePath('/transactions', { forceLocale: resolveLocale(page.url.pathname) })
	);
</script>

<!-- TODO: Color audit -->
<div
	class="bg-surface-container text-on-surface rounded-lg shadow-md"
	in:fly={{ duration: 150, x: '100%' }}
	out:fly={{ duration: 150, x: '100%' }}
	use:melt={$content(id)}
>
	<a class="text-inherit no-underline" href={transactionsHref}>
		<div class="relative flex items-center justify-between gap-4 p-5">
			<div>
				<h3 class="flex items-center gap-2 font-semibold" use:melt={$title(id)}>
					{data.title}
					<span class={`size-1.5 rounded-full ${data.color}`}></span>
				</h3>
				<div use:melt={$description(id)}>
					{data.description}
				</div>
			</div>
			<button
				class="hover:bg-on-surface-container absolute top-4 right-4 grid size-6 place-items-center rounded-full"
				use:melt={$close(id)}
				aria-label="close notification"
			>
				X
			</button>
		</div>
	</a>
</div>
