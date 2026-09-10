import type { ContractSummaries } from '$lib/types/transaction';

import powupresult from './powupresult.svelte';

export default {
	titles: {
		powupresult: 'Network Resources Received'
	},
	components: {
		powupresult
	}
} satisfies ContractSummaries;
