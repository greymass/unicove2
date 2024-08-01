<script lang="ts">
	import Button from '$lib/components/button/button.svelte';

	interface Props {
		options: { href: string; text: string; active: boolean }[];
		class?: string;
	}
	const { class: className, ...props }: Props = $props();
</script>

<menu aria-label="page functions" class={`flex flex-wrap gap-3 sm:self-end ${className}`}>
	{#each props.options as option}
		<Button href={option.href} variant="pill" active={option.active}>
			{option.text}
		</Button>
	{/each}
</menu>
