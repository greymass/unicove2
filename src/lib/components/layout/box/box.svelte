<!-- The Box is used to group content with a predefined padding
	this is the basis of the Card component -->

<script lang="ts">
	const { class: className = '', ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<div class={`box p-4 ${className}`} {...props}>
	{@render props.children()}
</div>
