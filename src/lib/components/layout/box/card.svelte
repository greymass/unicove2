<!-- The Card is a Box with slots for content and additional styling -->

<script lang="ts">
	const { class: className = '', title, titleTag = 'h3', children, ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<div class={`card ${className}`} {...props}>
	{#if title}
		<svelte:element this={titleTag} class="card-title h3">
			{title}
		</svelte:element>
	{/if}
	{@render children()}
</div>
