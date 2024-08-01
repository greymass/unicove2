<!-- Adaptive page margins -->

<script lang="ts">
	const { class: className = '', children, ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<div class={`px-page py-4 ${className}`} {...props}>
	{@render children()}
</div>
