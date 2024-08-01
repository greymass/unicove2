<!-- The Switcher switches a flexbox context between horizontal and a vertical layout at a given, parent container-based breakpoint. If the breakpoint is 30rem the layout will switch to vertical when the parent is less than 30rem wide. Useful when all elements inside the switcher are considered equal. -->

<script lang="ts">
	const { class: className = '', children, threshold = '30rem', ...props } = $props();
</script>

<div class={`layout-switcher ${className}`} {...props} style={`--switcher-threshold:${threshold}`}>
	{@render children()}
</div>
