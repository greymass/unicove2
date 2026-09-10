import type { ContractSummaries } from '$lib/types/transaction';

import exec from './exec.svelte';

export default {
	titles: {
		exec: 'Wrapped Transaction'
	},
	components: {
		exec
	}
} satisfies ContractSummaries;
