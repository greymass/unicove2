<script lang="ts">
	import { XIcon } from '@lucide/svelte';

	interface Props {
		onClear: () => void;
	}

	const { onClear }: Props = $props();
</script>

<button
	onclick={onClear}
	class="text-on-surface-variant hover:text-on-surface flex items-center gap-1 text-sm"
>
	<XIcon size={14} />
	<span class="hidden sm:inline">Clear</span>
</button>
