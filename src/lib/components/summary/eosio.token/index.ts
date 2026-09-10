import type { ContractSummaries } from '$lib/types/transaction';

import transfer from './transfer.svelte';

export default {
	titles: {
		transfer: 'Token Transfer'
	},
	components: {
		transfer
	}
} satisfies ContractSummaries;
