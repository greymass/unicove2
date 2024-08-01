<!-- The Stack component inserts vertical margins -->

<script lang="ts">
	const { class: className = '', ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<div class={`layout-stack ${className}`} {...props}>
	{@render props.children()}
</div>
