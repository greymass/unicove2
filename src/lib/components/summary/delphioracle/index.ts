import type { ContractSummaries } from '$lib/types/transaction';

import write from './write.svelte';

export default {
	titles: {
		write: 'DelphiOracle Data'
	},
	components: {
		write
	}
} satisfies ContractSummaries;
