import type { ContractSummaries } from '$lib/types/transaction';

import noop from './noop.svelte';

export default {
	titles: {
		noop: 'Resource Provider'
	},
	components: {
		noop
	}
} satisfies ContractSummaries;
