<script lang="ts">
	import { Button, Switcher } from '@wharfkit/svelte-components';
	import type { StatWindow } from '$lib/state/statindex/utils';

	interface Props {
		value: StatWindow;
	}

	let { value = $bindable() }: Props = $props();
</script>

<Switcher class="items-center gap-2">
	<Button variant={value === '30d' ? 'primary' : 'secondary'} onclick={() => (value = '30d')}>
		30 days
	</Button>
	<Button variant={value === '90d' ? 'primary' : 'secondary'} onclick={() => (value = '90d')}>
		90 days
	</Button>
	<Button variant={value === '365d' ? 'primary' : 'secondary'} onclick={() => (value = '365d')}>
		1 year
	</Button>
	<Button variant={value === 'all' ? 'primary' : 'secondary'} onclick={() => (value = 'all')}>
		All time
	</Button>
</Switcher>
