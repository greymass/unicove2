<script lang="ts">
	let props = $props();
</script>

<div class="flex flex-col gap-1">
	{@render props.children()}
</div>
