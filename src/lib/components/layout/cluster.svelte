<!-- The Cluster is used for groups of elements that differ in length, should be aligned horizontally, and are liable to wrap in small screen contexts. E.g. Buttons, Tags, Keywords, etc. -->

<script lang="ts">
	const { class: className = '', tag = 'div', ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<svelte:element this={tag} class={`layout-cluster ${className}`} {...props}>
	{@render props.children()}
</svelte:element>
