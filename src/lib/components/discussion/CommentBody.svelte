<script lang="ts">
	interface Props {
		body: string;
	}

	const { body }: Props = $props();
</script>

<pre class="comment-body">{body}</pre>

<style>
	.comment-body {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: inherit;
		font-size: inherit;
		margin: 0;
	}
</style>
