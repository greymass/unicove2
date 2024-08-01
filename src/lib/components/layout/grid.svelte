<!-- The Grid is like the Cluster but with all elements aligned to columns and rows -->

<script lang="ts">
	const { class: className = '', children, itemWidth = '20ch', ...props } = $props();
</script>

<div class={`layout-grid`} {...props} style={`--grid-itemWidth:${itemWidth}`}>
	{@render children()}
</div>
