<script lang="ts">
	import ShieldQuestion from '@lucide/svelte/icons/shield-question';
	import Info from '@lucide/svelte/icons/info';
	import { Stack } from '@wharfkit/svelte-components';
	import Tooltip from '$lib/components/tooltip/tooltip.svelte';
</script>

<Stack id="tooltips" class="space-y-8">
	<div>
		<h2 class="text-headline mb-4">Tooltips</h2>
		<p>Tooltips provide additional information when hovering over an element.</p>
	</div>

	<div>
		<Tooltip content="Another tooltip example">
			<span class="cursor-help underline">Small tooltip</span>
		</Tooltip>
	</div>

	<div>
		<Tooltip
			content="This is a medium-length tooltip that provides more detailed information about a feature or concept."
		>
			<span class="cursor-help underline">Medium tooltip</span>
		</Tooltip>
	</div>

	<div>
		<Tooltip
			content="This is a longer tooltip that can be used to provide comprehensive explanations or instructions. It's useful when you need to convey more complex information without cluttering the main interface. Remember that tooltips should still be concise and to the point."
		>
			<span class="cursor-help underline">Large tooltip</span>
		</Tooltip>
	</div>

	<div>
		<Tooltip
			content="This is a long tooltip with an icon. Icons can be used to provide visual cues about the type of information being presented. For example, this icon might indicate that the tooltip contains important or critical information that the user should pay attention to."
			icon={ShieldQuestion}
		>
			<span class="cursor-help underline">Tooltip with custom icon</span>
		</Tooltip>
	</div>

	<div>
		<Tooltip
			content="This tooltip has a longer open and close delay, making it slower to appear and disappear when hovering."
			openDelay={1000}
			closeDelay={1000}
		>
			<span class="cursor-help underline">Slow open and close tooltip</span>
		</Tooltip>
	</div>

	<div>
		<Tooltip
			content="This tooltip has a longer fade in duration, making it show up more slowly."
			fadeDuration={1000}
		>
			<span class="cursor-help underline">Slowly appearing tooltip</span>
		</Tooltip>
	</div>

	<div>
		<Tooltip content="This tooltip is on an icon.">
			<span class="inline-block cursor-help">
				<Info />
			</span>
		</Tooltip>
	</div>
</Stack>
